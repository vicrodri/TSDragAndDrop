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

type Listener<T> = (items: T[]) => void;

//Project State Management
class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private static instance: ProjectState;
  private projects: Project[] = [];

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
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

//Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedHTMLNode = document.importNode(this.templateElement.content, true);
    this.element = importedHTMLNode.firstElementChild as U;
    this.element.id = newElementId ? newElementId : "";

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProjectList: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjectList = [];

    this.configure();
    this.renderContent();
  }

  configure() {
    projectState.addListener((projectList: Project[]) => {
      const projectsToShow = projectList.filter((item) =>
        this.type === "active"
          ? item.status === ProjectStatus.Active
          : item.status === ProjectStatus.Finished
      );
      this.assignedProjectList = projectsToShow;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = `${this.type.toUpperCase()} PROJECTS`;
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
}

//ProjectInput Class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

    this.titleInputElement = this.element.querySelector("#title") as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description") as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people") as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHandler);
  }

  renderContent() {}

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
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
