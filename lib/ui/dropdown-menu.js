class DropDownMenu {
  constructor(rootElement) {
    rootElement.querySelector('button').addEventListener('click', this.toggle.bind(this));

    this._rootElement = rootElement;
  }

  toggle() {
    this._rootElement.querySelector('.dropdown-menu').classList.toggle('visible');
  }

  addItem(name, callback, state) {
    var dropDownMenu = this;

    var button = document.createElement('button');
    button.innerText = name;

    if(state === true || state === false) {
      var icon = document.createElement('i');
      icon.setAttribute('class', 'fa sml');
      icon.classList.add(state ? 'fa-check-square-o': 'fa-square-o');

      button.innerText += ' ';
      button.appendChild(icon);
    }

    button.addEventListener('click', () => {
      dropDownMenu.toggle();

      if(icon) {
        icon.classList.toggle('fa-check-square-o');
        icon.classList.toggle('fa-square-o');
        state = !state;
        callback(state)
      } else {
        callback();
      }
    });

    this._rootElement.querySelector('.dropdown-menu').appendChild(button);
  }
}

export default DropDownMenu;