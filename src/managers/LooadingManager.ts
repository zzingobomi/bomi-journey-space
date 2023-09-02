// TODO: async 로 실시간으로 로딩 상황 확인할 수 있도록..
export class LoadingManager {
  private loadingEle: HTMLDivElement;
  private loadingTitle: HTMLDivElement;
  private loadingDesc: HTMLDivElement;

  constructor() {
    this.loadingEle = window.document.getElementById(
      "loading"
    ) as HTMLDivElement;
    this.loadingTitle = window.document.getElementById(
      "loading-title"
    ) as HTMLDivElement;
    this.loadingDesc = window.document.getElementById(
      "loading-desc"
    ) as HTMLDivElement;
  }

  public DisplayLoadingUI() {
    this.loadingEle.style.display = "block";
  }

  public HideLoadingUI() {
    this.loadingEle.style.display = "none";
  }

  public ShowLoadingTitle(msg: string) {
    if (this.loadingTitle) {
      this.loadingTitle.innerHTML = msg;
    }
  }

  public ShowLoadingDesc(msg: string) {
    if (this.loadingDesc) {
      this.loadingDesc.innerHTML = msg;
    }
  }
}
