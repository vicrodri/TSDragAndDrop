// Code goes here!
enum ProjectStatus {
  Active,
  Finished,
}
//Project Type
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener = (items: Project[]) => void;

//Project State Management
class ProjectState {
  private static instance: ProjectState;
  private projects: Project[] = [];
  private listeners: Listener[] = [];

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, numOfPeople: number) {
    const project = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(project);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//Autobind Decorator
const autobind = (_: any, _2: string, descriptor: PropertyDescriptor) => {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjustedDescriptor;
};

//Validator Decorator
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validateInput = (validatableInput: Validatable) => {
  let isValid = true;
  isValid =
    isValid && validatableInput.required
      ? isValid && validatableInput.value.toString().length > 0
      : isValid;
  isValid =
    isValid && validatableInput.minLength && typeof validatableInput.value === "string"
      ? isValid && validatableInput.value.length > validatableInput.minLength
      : isValid;
  isValid =
    isValid && validatableInput.maxLength && typeof validatableInput.value === "string"
      ? isValid && validatableInput.value.length < validatableInput.maxLength
      : isValid;
  isValid =
    isValid && validatableInput.min && typeof validatableInput.value === "number"
      ? isValid && validatableInput.value > validatableInput.min
      : isValid;
  isValid =
    isValid && validatableInput.max && typeof validatableInput.value === "number"
      ? isValid && validatableInput.value < validatableInput.max
      : isValid;

  return isValid;
};

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjectList: Project[];

  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.assignedProjectList = [];
    const importedHTMLNode = document.importNode(this.templateElement.content, true);
    this.element = importedHTMLNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projectList: Project[]) => {
      const projectsToShow = projectList.filter((item) =>
        this.type === "active"
          ? item.status === ProjectStatus.Active
          : item.status === ProjectStatus.Finished
      );
      this.assignedProjectList = projectsToShow;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const item of this.assignedProjectList) {
      const listItem = document.createElement("li");
      listItem.textContent = item.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
}

//ProjectInput Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;

  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedHTMLNode = document.importNode(this.templateElement.content, true);
    this.element = importedHTMLNode.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private getUserInput(): [string, string, number] | void {
    const titleValue = this.titleInputElement.value;
    const descriptionValue = this.descriptionInputElement.value;
    const peopleValue = this.peopleInputElement.value;

    const validatableTitle: Validatable = {
      value: titleValue,
      required: true,
    };
    const validatableDesc: Validatable = {
      value: descriptionValue,
      required: true,
      minLength: 5,
    };
    const validatablePeople: Validatable = {
      value: peopleValue,
      required: true,
      max: 5,
      min: 1,
    };

    if (
      !validateInput(validatableTitle) ||
      !validateInput(validatableDesc) ||
      !validateInput(validatablePeople)
    ) {
      console.error("hay un trastazo");
      return;
    }

    return [titleValue, descriptionValue, +peopleValue];
  }

  private clearInputElements() {
    this.element.reset();
  }

  @autobind
  private submitHandler(event: Event) {
    event.preventDefault();

    const userInput = this.getUserInput();
    if (Array.isArray(userInput)) {
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
      this.clearInputElements();
    }
  }

  private configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
