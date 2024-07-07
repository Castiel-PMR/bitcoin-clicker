const API_BASE_URL = "https://c022-95-153-90-59.ngrok-free.app"; // Замените на ваш URL ngrok
let count = 0.0;
let lastClickTime = 0;
const clickInterval = 150;
const incrementValue = 0.001;
let clickCount = 0;
let nextChestClicks = getRandomClicks(50, 200);
let bonusActive = false;

function getUserIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('user_id');
}

function getRandomClicks(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const userId = getUserIdFromUrl();
if (!userId) {
    alert("User ID not found!");
    throw new Error("User ID not found");
}

const clickArea = document.getElementById('click-area');
const pickaxe = document.getElementById('pickaxe');
const rock = document.getElementById('rock');
const counter = document.getElementById('counter');
const clickSound = document.getElementById('click-sound');
const sparks = document.getElementById('sparks');
const chestSound = new Audio('chest.mp3'); // Добавьте файл chest.mp3 в проект

async function loadUserData() {
    try {
        console.log('Loading user data...');
        const response = await fetch(`${API_BASE_URL}/api/load/${userId}`, {
            headers: {
                'ngrok-skip-browser-warning': 'true',
                'Content-Type': 'application/json'
            }
        });
        const userData = await response.json();
        count = userData.btcCount;
        counter.textContent = `BTC: ${count.toFixed(3)}`;
        console.log('User data loaded:', userData);
    } catch (error) {
        console.error('Error loading user data:', error);
    }
}

async function saveUserData() {
    try {
        console.log('Saving user data...');
        const response = await fetch(`${API_BASE_URL}/api/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            },
            body: JSON.stringify({ telegramId: userId, btcCount: count }),
        });
        const userData = await response.json();
        console.log('User data saved:', userData);
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

function showChestBonusMessage(bonus) {
    const chestBonusMessage = document.createElement('div');
    chestBonusMessage.textContent = `+ ${bonus.toFixed(3)} 💰`;
    chestBonusMessage.classList.add('chest-bonus-message');
    document.body.appendChild(chestBonusMessage);
    setTimeout(() => {
        document.body.removeChild(chestBonusMessage);
    }, 3000); // Текст будет отображаться 3 секунды
}

function showChests() {
    const chestContainer = document.createElement('div');
    chestContainer.id = 'chest-container';

    for (let i = 0; i < 3; i++) {
        const chest = document.createElement('img');
        chest.src = 'box.png'; // Путь к закрытому сундуку
        chest.classList.add('chest');
        chest.addEventListener('click', () => {
            const bonus = (Math.random() * 4.5) + 0.5; // Генерация случайного бонуса от 0.5 до 5
            count += bonus;
            counter.textContent = `BTC: ${count.toFixed(3)}`;
            chest.src = 'box_open.png'; // Путь к открытому сундуку
            chestSound.play();
            showChestBonusMessage(bonus);
            saveUserData();
            setTimeout(() => {
                document.body.removeChild(chestContainer);
                bonusActive = false;
            }, 2000);
        });
        chestContainer.appendChild(chest);
    }

    document.body.appendChild(chestContainer);
    chestSound.play();
    bonusActive = true;
}

clickArea.addEventListener('click', () => {
    if (bonusActive) return; // Блокируем клики, если бонус активен

    const currentTime = new Date().getTime();
    if (currentTime - lastClickTime < clickInterval) {
        return;
    }

    lastClickTime = currentTime;
    clickCount++;
    count += incrementValue;

    // Показ сундуков раз в случайное количество кликов от 50 до 100
    if (clickCount >= nextChestClicks) {
        clickCount = 0; // Сброс счетчика кликов
        nextChestClicks = getRandomClicks(50, 100); // Обновление количества кликов до следующего сундука
        showChests();
    }

    counter.textContent = `BTC: ${count.toFixed(3)}`;
    clickSound.currentTime = 0;
    clickSound.play();
    saveUserData();
    sparks.style.opacity = '1';
    sparks.style.transform = 'translate(-50%, -50%) scale(1)';
    sparks.classList.add('spark-animation');
    pickaxe.style.transform = 'translate(-50%, 0) rotate(45deg)';

    setTimeout(() => {
        pickaxe.style.transform = 'translate(-50%, 0) rotate(0deg)';
        sparks.style.opacity = '0';
        sparks.classList.remove('spark-animation');
    }, 100);

    rock.style.transform = 'translateX(-50%) rotate(-3deg)';
    setTimeout(() => {
        rock.style.transform = 'translateX(-50%) rotate(3deg)';
        setTimeout(() => {
            rock.style.transform = 'translateX(-50%) rotate(0deg)';
        }, 100);
    }, 100);
});

document.addEventListener('DOMContentLoaded', (event) => {
    // Проверка, что мы в Telegram WebApp
    if (window.Telegram.WebApp) {
        openFullscreen();
    }
});

loadUserData();
