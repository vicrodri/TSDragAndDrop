/// <reference path='./base-component.ts' />
/// <reference path='../util/validation.ts' />
/// <reference path='../decorators/autobind.ts' />
/// <reference path='../state/project-state.ts' />

namespace App {
  //ProjectInput Class
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}
