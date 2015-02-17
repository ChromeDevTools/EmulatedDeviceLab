import Modal from './modal';

var template = document.getElementById('welcome-modal-tpl');

class WelcomeModal extends Modal {
  constructor() {
    super();

    var welcomeElement = document.importNode(template.content, true);
    this.setContent(welcomeElement);
  }
}

export default WelcomeModal;