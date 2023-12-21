import { Component } from "./base-component.js";
import { autobind } from "../decorators/autobind.js";
import { Project, ProjectStatus } from "../models/project.js";
import { DragTarget } from "../models/drag-drop.js";
import { projectState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";

//ProjectLIst Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjectList: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjectList = [];

    this.configure();
    this.renderContent();
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

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
      new ProjectItem(this.element.querySelector("ul")!.id, item);
    }
  }

  @autobind
  dragLeaveHandler(_: DragEvent): void {
    const listElement = this.element.querySelector("ul");
    listElement?.classList.remove("droppable");
  }

  @autobind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer?.types[0] === "text/plain") {
      event.preventDefault();
      const listElement = this.element.querySelector("ul");
      listElement?.classList.add("droppable");
    }
  }

  @autobind
  dropHandler(event: DragEvent): void {
    const projectId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projectId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }
}
