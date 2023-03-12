// eslint-disable-next-line no-undef
const socket = io();

const inboxPeople = document.querySelector('.inbox__people');
const inputField = document.querySelector('.message_form__input');
const messageForm = document.querySelector('.message_form');
const messageBox = document.querySelector('.messages__history');
const fallback = document.querySelector('.fallback');

const roomInput = document.querySelector('.room_form__input');
const createRoomButton = document.querySelector('.createroom_form__button');
const joinRoomButton = document.querySelector('.joinroom_form__button');
const usernameInput = document.querySelector('.username_form__input');

const userName = '';

const createRoom = (userId, roomID) => {
  const obj = { userId, roomID };
  socket.emit('create', obj);
};

const joinRoom = (userId, roomID) => {
  const obj = { userId, roomID: roomID ?? '1234' };
  socket.emit('join', obj);
};

const addToUsersBox = (userId) => {
  if (document.querySelector(`.${userId}-userlist`)) {
    return;
  }

  const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
  inboxPeople.innerHTML += userBox;
};

const addNewMessage = ({ user, message }) => {
  const time = new Date();
  const formattedTime = time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric' });

  const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

  messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
};

// new user is created so we generate nickname and emit event (default)
// newUserConnected();

messageForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  socket.emit('chat message', {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = '';
});

inputField.addEventListener('keyup', () => {
  socket.emit('typing', {
    isTyping: inputField.value.length > 0,
    nick: userName,
  });
});

socket.on('join', (data) => {
  data.map((user) => addToUsersBox(user));
});

socket.on('user disconnected', (existingUser) => {
  document.querySelector(`.${existingUser}-userlist`).remove();
});

socket.on('chat message', (data) => {
  addNewMessage({ user: data.nick, message: data.message });
});

socket.on('wrong roomID!', () => {
  window.alert('No such room exists');
});

socket.on('typing', (data) => {
  const { isTyping, nick } = data;

  if (!isTyping) {
    fallback.innerHTML = '';
    return;
  }

  fallback.innerHTML = `<p>${nick} is typing...</p>`;
});

// create room
createRoomButton.addEventListener('click', (e) => {
  e.preventDefault();
  if (!usernameInput.value) {
    window.alert('please enter username!');
    return;
  }
  if (!roomInput.value) {
    window.alert('please enter room id!');
    return;
  }

  console.log('hit event create');

  // if (e?.)
  createRoom(usernameInput.value, roomInput.value);
});

// join room
joinRoomButton.addEventListener('click', (e) => {
  e.preventDefault();
  if (!usernameInput.value) {
    window.alert('please enter username!');
    return;
  }
  if (!roomInput.value) {
    window.alert('please enter room id!');
    return;
  }

  console.log('hit event');

  // if (e?.)
  joinRoom(usernameInput.value, roomInput.value);
});
