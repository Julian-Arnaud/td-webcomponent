const template = document.createElement("template");
template.innerHTML = `
<style>
    button{
        border-radius: 5px;
    }
    #pStart{
        background-color: green;
    }
    #pPause{
        background-color: yellow;
    }
    #pStop{
        background-color: orange;
    }
    #pLoop{
        background-color: pink;
    }
    #p10, #m10 {
        background-color: #00AAFF;
    }
</style>
<video id="myVid" src="video/video.ogg" type="video/ogg" width="480" height="320"></video>
<div id="myButtons">
    <button id="pStart">Start</button>
    <button id="pPause">Pause</button>
    <button id="pStop">Stop</button>
    <button id="p10">+10</button>
    <button id="m10">-10</button>
    <button id="pLoop">En boucle</button>
</div>
`;

class MyVideo extends HTMLElement{
    constructor(){
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback(){
        this.video = this.shadowRoot.querySelector("#myVid");
        this.declareListeners();
    }

    declareListeners(){
        this.shadowRoot.querySelector("#pStart").addEventListener("click", (event) => {
            this.vStart();
        });
        this.shadowRoot.querySelector("#pPause").addEventListener("click", (event) => {
            this.vPause();
        });
        this.shadowRoot.querySelector("#pStop").addEventListener("click", (event) => {
            this.vStop();
        });
        this.shadowRoot.querySelector("#p10").addEventListener("click", (event) => {
            this.vP();
        });
        this.shadowRoot.querySelector("#m10").addEventListener("click", (event) => {
            this.vM();
        });
        this.shadowRoot.querySelector("#pLoop").addEventListener("click", (event) => {
            this.vLoop();
          });
    }

    vStart(){
        this.video.play();
    }
    vPause(){
        this.video.pause();
    }
    vStop(){
        this.video.load();
    }
    vP(){
        this.video.currentTime += 10;
    }
    vM(){
        this.video.currentTime -= 10;
    }
    vLoop(){
        this.video.loop = !this.video.loop;
    }
}
customElements.define("custom-video", MyVideo);
