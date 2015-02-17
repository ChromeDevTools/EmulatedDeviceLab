import Modal from './modal';

var template = document.getElementById('welcome-modal-tpl');

class WelcomeModal extends Modal {
  constructor() {
    super();

    var welcomeElement = document.importNode(template.content, true);
    this.setContent(welcomeElement);

    var rootElement = this._rootElement;

    rootElement.classList.add('welcome-modal');

    rootElement.querySelector('.next-step').addEventListener('click', this.nextStep.bind(this));

    this._stepsCount = rootElement.querySelectorAll('.step').length;
    this._stepIdx = 0;

    this._updateSteps();
  }

  nextStep() {
    if(this._stepIdx < this._stepsCount - 1) {
      this._stepIdx++;
      this._updateSteps();
    } else {
      this.close();
    }
  }

  _updateSteps() {
    var steps = this._rootElement.querySelectorAll('.step');
    var count = this._rootElement.querySelector('.count');
    var currentStep = this._rootElement.querySelector('.step.visible');

    if(currentStep) {
      currentStep.classList.remove('visible');
    }

    currentStep = steps[this._stepIdx];
    if(currentStep) {
      currentStep.classList.add('visible');

      count.innerText = (this._stepIdx + 1) + '/' + steps.length;

      if(currentStep.dataset.height) {
        this.setHeight(currentStep.dataset.height);
      }

      if(currentStep.dataset.width) {
        this.setWidth(currentStep.dataset.width);
      }

      var video = currentStep.querySelector('video');
      if(video) {
        var playButton = currentStep.querySelector('button.play');

        playButton.addEventListener('click', () => {
          video.play();
          video.parentNode.classList.add('playing');
        });

        video.addEventListener('ended', () => {
          setTimeout(() => {
            video.parentNode.classList.remove('playing');
          }, 1000);
        });

      }
    }
  }
}

export default WelcomeModal;