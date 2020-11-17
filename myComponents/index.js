
import './lib/webaudio-controls.js';

const getBaseURL = () => {
  const base = new URL('.', import.meta.url);
  console.log("Base = " + base);
	return `${base}`;
};

const template = document.createElement("template");
template.innerHTML = `
  <style>
    H1 {
          color:red;
    }
    button{
      border-radius: 5px;
    }
  </style>
  
  <audio id="myPlayer" >
        <source src="audio/track1.wav" type="audio/wav"/>
    </audio>
    <button id="pauseButton">Pause</button>
    <button id="playButton">Play</button>
    <button id="zeroButton">Retour à zero</button>
    <br>
    Volume: 0 <input type="range" min=0 max=1 step=0.1 id="slideVolume"> 1
    <br>
    Variation du volume: <webaudio-knob id="knobVolume" tooltip="Volume:%s" src="./assets/imgs/bouton2.png" sprites="127" value=1 min="0" max="1" step=0.01>
        Volume</webaudio-knob>
        Variation de la balance: 
        <webaudio-knob id="knobVolume2" tooltip="Volume:%s" src="./assets/imgs/bouton2.png" sprites="127" value=0.5 min="0" max="1" step=0.01>
        Volume</webaudio-knob>
        <input type="button" id="razBalance" value="Reset la balance g/d"/>
        <br>
        <canvas id="viSual" height="400" width="800"></canvas>
        `;

class MyAudioPlayer extends HTMLElement {
  constructor() {
    super();
    this.volume = 0.5;
    this.analyserNode;
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.basePath = getBaseURL(); // url absolu du composant
    // Fix relative path in WebAudio Controls elements
    this.fixRelativeImagePaths();
  }

  connectedCallback() {
    this.player = this.shadowRoot.querySelector("#myPlayer");
    this.player.loop = true;

    this.declareListeners();
    this.canvas = this.shadowRoot.querySelector("#viSual");
    this.ctx = this.canvas.getContext("2d");
    this.audioContext = new AudioContext();
    this.audioElement = this.shadowRoot.querySelector("#myPlayer")
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 2048;
    this.source = this.audioContext.createMediaElementSource(this.audioElement);
    this.source.connect(this.analyserNode);
//this connects our music back to the default output, such as your //speakers 
    this.source.connect(this.audioContext.destination);
    this.datas = new Uint8Array(this.analyserNode.frequencyBinCount);
    //this.analyserNode.getByteFrequencyData(this.datas);
    this.stereoNode = new StereoPannerNode(this.audioContext, { pan: 0 });
    this.loopingFunction();
  }

  getAudioContext(){
    return this.audioContext;
  }

  loopingFunction(){
    this.analyserNode.getByteFrequencyData(this.datas);
    this.draw(this.datas);
    requestAnimationFrame(() =>{ this.loopingFunction(); })
  }

  draw(dta){
    let dat = [...dta];
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let space = this.canvas.width / this.datas.length;
    dat.forEach((value,i)=>{
      this.ctx.beginPath();
      this.ctx.moveTo(space * i, this.canvas.height); //x,y
      this.ctx.lineTo(space * i, this.canvas.height - value); //x,y
      this.ctx.stroke();
    })
  }

  fixRelativeImagePaths() {
		// change webaudiocontrols relative paths for spritesheets to absolute
		let webaudioControls = this.shadowRoot.querySelectorAll(
			'webaudio-knob, webaudio-slider, webaudio-switch, img'
		);
		webaudioControls.forEach((e) => {
			let currentImagePath = e.getAttribute('src');
			if (currentImagePath !== undefined) {
				//console.log("Got wc src as " + e.getAttribute("src"));
				let imagePath = e.getAttribute('src');
        //e.setAttribute('src', this.basePath  + "/" + imagePath);
        e.src = this.basePath  + "/" + imagePath;
        //console.log("After fix : wc src as " + e.getAttribute("src"));
			}
		});
  }

  declareListeners() {
    this.shadowRoot.querySelector("#playButton").addEventListener("click", (event) => {
      this.play();
      this.getAudioContext().resume();
    });
    this.shadowRoot.querySelector("#pauseButton").addEventListener("click", (event) => {
      this.pause();
      this.getAudioContext().suspend();
    });
    this.shadowRoot.querySelector("#zeroButton").addEventListener("click", (event) => {
      this.raz();
    });
    this.shadowRoot.querySelector("#slideVolume").addEventListener("input", (event) => {
      this.setVolume(event.target.value);
    });
    this.shadowRoot.querySelector("#razBalance").addEventListener("click", (event) => {
      this.resetBalance();
    });
    this.shadowRoot
      .querySelector("#knobVolume")
      .addEventListener("input", (event) => {
        this.setVolume(event.target.value);
      });
    this.shadowRoot
    .querySelector("#knobVolume2")
    .addEventListener("input", (event) => {
      this.leftRight(event.target.value);
    });
  }
  
  // API

  resetBalance(){
    this.stereoNode.pan.value = 0;
    this.shadowRoot.querySelector("#knobVolume2").value = 0.5;
  }
  leftRight(value){
    

    // change the value of the balance by updating the pan value
    this.stereoNode.pan.value = value < 0.3 ? -1 : value > 0.7 ? 1 : 0;
    console.log(this.stereoNode.pan.value);
    this.source.connect(this.stereoNode).connect(this.audioContext.destination);
  }

  setVolume(val) {
    this.player.volume = val;
  }

  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  raz(){
    this.player.currentTime = 0;
  }
}

customElements.define("my-audioplayer", MyAudioPlayer);
