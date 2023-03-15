import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

/**
 *
 * @param {string} element while u write something in form it will be start a loading in input
 */
function loader(element) {
  element.textContent = "";

  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}
//s
/**
 * function use for render letter and show us
 */
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now(); //to get a unique id
  const randomNumber = Math.random(); //to get more unique id
  const hexadecimalString = randomNumber.toString(16); //more than more unique

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAI, value, uniqueId) {
  return `
      <div class="wrapper ${isAI && "ai"}">
        <div class="chat">
          <div class="profile">
          <img 
          src="${isAI ? bot : user}"
          alt="${isAI ? "bot" : "user"}"
           />
          </div>
          <div class="message" id=${uniqueId}>${value}</div>
        </div>
      </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  //user's chat stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  //fetch data from the server -> get bot's response

  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something went wrong!";

    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
