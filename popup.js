// Add at the beginning of your file
function updateDateTime() {
    const timeElement = document.getElementById('current-time');
    const dateElement = document.getElementById('current-date');
    
    const now = new Date();
    
    // Update time
    timeElement.textContent = now.toLocaleTimeString();
    
    // Update date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateElement.textContent = now.toLocaleDateString('en-US', options);
}

// Update every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call

let timer;
let timeLeft;
let isRunning = false;

// DOM Elements
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const startButton = document.getElementById('start-timer');
const resetButton = document.getElementById('reset-timer');
const modeBtns = document.querySelectorAll('.mode-btn');
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Tab Switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const tabId = btn.dataset.tab + '-tab';
        tabContents.forEach(content => {
            content.classList.add('hidden');
            if (content.id === tabId) {
                content.classList.remove('hidden');
            }
        });

        // Toggle floating timer visibility
        if (typeof toggleFloatingTimer === 'function') {
            toggleFloatingTimer(isRunning);
        }

        // Call this when switching to home tab
        if (btn.dataset.tab === 'home') {
            updateHomeLists();
        }
    });
});

// Update the timer display function
function updateDisplay(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    minutesDisplay.textContent = minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = seconds.toString().padStart(2, '0');

    // Update floating timer
    if (typeof updateFloatingTimer === 'function') {
        updateFloatingTimer(minutes, seconds);
    }

    // Calculate the percentage of time left
    const totalTime = parseInt(document.querySelector('.mode-btn.active').dataset.time) * 60;
    const progress = (timeInSeconds / totalTime) * 100;

    // Update the circular progress
    const circleProgress = document.querySelector('.circle-progress');
    const offset = 439.82 - (progress / 100) * 439.82;
    circleProgress.style.strokeDashoffset = offset;
}

// Update the startTimer function
function startTimer() {
    if (!isRunning) {
        isRunning = true;
        startButton.textContent = 'Pause';
        if (typeof toggleFloatingTimer === 'function') {
            toggleFloatingTimer(true);
        }
        timer = setInterval(() => {
            timeLeft--;
            updateDisplay(timeLeft);
            if (timeLeft === 0) {
                clearInterval(timer);
                isRunning = false;
                startButton.textContent = 'Start';
                if (typeof toggleFloatingTimer === 'function') {
                    toggleFloatingTimer(false);
                }
                new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg').play();
            }
        }, 1000);
    } else {
        clearInterval(timer);
        isRunning = false;
        startButton.textContent = 'Start';
        if (typeof toggleFloatingTimer === 'function') {
            toggleFloatingTimer(false);
        }
    }
}

// Update the resetTimer function
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startButton.textContent = 'Start';
    if (typeof toggleFloatingTimer === 'function') {
        toggleFloatingTimer(false);
    }
    const activeMode = document.querySelector('.mode-btn.active');
    timeLeft = parseInt(activeMode.dataset.time) * 60;
    updateDisplay(timeLeft);
}


// Mode Selection
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        timeLeft = parseInt(btn.dataset.time) * 60;
        updateDisplay(timeLeft);
        clearInterval(timer);
        isRunning = false;
        startButton.textContent = 'Start';
    });
});

// Todo List Functions
function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <input type="checkbox">
            <span>${taskText}</span>
            <span class="delete-task">×</span>
        `;
        taskList.appendChild(taskItem);
        taskInput.value = '';
        saveTasks();
    }
}

function toggleTask(checkbox) {
    const taskItem = checkbox.parentElement;
    taskItem.classList.toggle('completed');
    saveTasks();
}

function deleteTask(deleteBtn) {
    deleteBtn.parentElement.remove();
    saveTasks();
}

// Schedule Functions
function addScheduleItem() {
    const title = document.getElementById('schedule-title').value.trim();
    const time = document.getElementById('schedule-time').value;
    
    if (title && time) {
        const scheduleList = document.querySelector('.schedule-list');
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <span class="schedule-time">${time}</span>
            <span class="schedule-title">${title}</span>
            <span class="delete-btn">×</span>
        `;
        scheduleList.appendChild(scheduleItem);
        
        document.getElementById('schedule-title').value = '';
        document.getElementById('schedule-time').value = '';
        
        saveSchedule();
    }
}

// Countdown Functions
function addCountdownItem() {
    const title = document.getElementById('countdown-title').value.trim();
    const date = document.getElementById('countdown-date').value;
    
    if (title && date) {
        const countdownList = document.querySelector('.countdown-list');
        const countdownItem = document.createElement('div');
        countdownItem.className = 'countdown-item';
        
        const daysLeft = calculateDaysLeft(date);
        
        countdownItem.innerHTML = 
            `<div class="countdown-info">
                <div class="countdown-title">${title}</div>
                <div class="countdown-days">${daysLeft}</div>
            </div>
            <span class="delete-btn">×</span>`;
        
        countdownList.appendChild(countdownItem);
        
        document.getElementById('countdown-title').value = '';
        document.getElementById('countdown-date').value = '';
        
        saveCountdowns();
    }
}


function calculateDaysLeft(targetDate) {
    const target = new Date(targetDate);
    const today = new Date();
    const timeDiff = target.getTime() - today.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // If the countdown has passed
    if (isNaN(daysLeft) || daysLeft <= 0) {
        return "You just passed the day";
    }

    return daysLeft;
}

function updateCountdowns() {
    const countdownItems = document.querySelectorAll('.countdown-item');
    countdownItems.forEach(item => {
        const title = item.querySelector('.countdown-title').textContent;
        const date = item.dataset.date;
        const daysLeft = calculateDaysLeft(date);
        item.querySelector('.countdown-days').textContent = `${daysLeft} left`;
    });
}


// Storage Functions
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('.task-item').forEach(item => {
        tasks.push({
            text: item.querySelector('span').textContent,
            completed: item.classList.contains('completed')
        });
    });
    chrome.storage.local.set({ tasks });
}

function saveSchedule() {
    const schedule = [];
    document.querySelectorAll('.schedule-item').forEach(item => {
        schedule.push({
            title: item.querySelector('.schedule-title').textContent,
            time: item.querySelector('.schedule-time').textContent
        });
    });
    chrome.storage.local.set({ schedule });
}

function saveCountdowns() {
    const countdowns = [];
    document.querySelectorAll('.countdown-item').forEach(item => {
        countdowns.push({
            title: item.querySelector('.countdown-title').textContent,
            date: item.dataset.date
        });
    });
    chrome.storage.local.set({ countdowns });
}

function loadData() {
    chrome.storage.local.get(['tasks', 'schedule', 'countdowns'], (result) => {
        // Load tasks
        if (result.tasks) {
            result.tasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item' + (task.completed ? ' completed' : '');
                taskItem.innerHTML = `
                    <input type="checkbox" ${task.completed ? 'checked' : ''}>
                    <span>${task.text}</span>
                    <span class="delete-task">×</span>
                `;
                taskList.appendChild(taskItem);
            });
        }
        
        // Load schedule
        if (result.schedule) {
            const scheduleList = document.querySelector('.schedule-list');
            result.schedule.forEach(item => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item';
                scheduleItem.innerHTML = `
                    <span class="schedule-time">${item.time}</span>
                    <span class="schedule-title">${item.title}</span>
                    <span class="delete-btn">×</span>
                `;
                scheduleList.appendChild(scheduleItem);
            });
        }
        
        // Load countdowns
        if (result.countdowns) {
            const countdownList = document.querySelector('.countdown-list');
            result.countdowns.forEach(item => {
                const countdownItem = document.createElement('div');
                countdownItem.className = 'countdown-item';
                countdownItem.dataset.date = item.date;
                
                const daysLeft = calculateDaysLeft(item.date);
                
                countdownItem.innerHTML = `
                    <div class="countdown-info">
                        <div class="countdown-title">${item.title}</div>
                        <div class="countdown-days">${daysLeft} days left</div>
                    </div>
                    <span class="delete-btn">×</span>
                `;
                countdownList.appendChild(countdownItem);
            });
        }
    });
}

// Event Listeners
startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
addTaskButton.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});

document.getElementById('add-schedule').addEventListener('click', addScheduleItem);
document.getElementById('add-countdown').addEventListener('click', addCountdownItem);

// Delete buttons for schedule and countdown items
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        e.target.parentElement.remove();
        if (e.target.closest('.schedule-list')) {
            saveSchedule();
        } else if (e.target.closest('.countdown-list')) {
            saveCountdowns();
        }
    }
});

taskList.addEventListener('click', (e) => {
    if (e.target.type === 'checkbox') {
        toggleTask(e.target);
    } else if (e.target.classList.contains('delete-task')) {
        deleteTask(e.target);
    }
});

// Initialize
timeLeft = 25 * 60; // 25 minutes
updateDisplay(timeLeft);
loadData();

// Update countdowns daily
setInterval(updateCountdowns, 1000 * 60 * 60 * 24); // Update every 24 hours