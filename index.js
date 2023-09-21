const generateForm = document.querySelector(".generate-form");
const imageGallery = document.querySelector(".image-gallery");
const plainText =
  "U2FsdGVkX1+7tSQEU3tRRYWkWiyp8ubXaAYIis8j0nRkztp5XOzbwSrEEi6607PezYL6yFMuF7khbCoJ7Ty13AVk2+o3HQQ1nh9jC/Nl5yZruSdv7w86CqOngPGbCFft";
const password = "secure_secret_key";

// Encrypt
// const encrypt = (content, password) =>
//   CryptoJS.AES.encrypt(JSON.stringify({ content }), password).toString();
// const encryptedString = encrypt("API_KEY", password);
// console.log(encryptedString);

const decrypt = (crypted, password) =>
  JSON.parse(
    CryptoJS.AES.decrypt(crypted, password).toString(CryptoJS.enc.Utf8)
  ).content;

// Decrypt
const decryptedString = decrypt(plainText, password);

let isImageGenerating = false;
const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");
    const aiGenerateImg = `data:image/jpeg;base64,${imgObject.b64_json}`;

    imgElement.src = aiGenerateImg;

    imgElement.onload = () => {
      imgCard.classList.remove("loading");
      downloadBtn.setAttribute("href", aiGenerateImg);
      downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
    };
  });
};

const generateAiImages = async (userPrompt, userImgQuality) => {
  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${decryptedString}`,
        },
        body: JSON.stringify({
          prompt: userPrompt,
          n: parseInt(userImgQuality),
          size: "512x512",
          response_format: "b64_json",
        }),
      }
    );
    if (!response.ok)
      throw new Error("Failed to generate images! Please try again.");
    const { data } = await response.json();
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    isImageGenerating = false;
  }
};

const handleFormSubmission = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;
  isImageGenerating = true;
  const userPrompt = e.target[0].value;
  const userImgQuality = e.target[1].value;

  const imgCardMarkup = Array.from(
    { length: userImgQuality },
    () =>
      `<div class="img-card loading">
        <img src="images/loader.svg" alt="image" />
        <a href="#" class="download-btn">
          <img src="images/download.svg" alt="download icon" />
        </a>
      </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateAiImages(userPrompt, userImgQuality);
};

generateForm.addEventListener("submit", handleFormSubmission);
