/**
 * script.js
 * * Main JavaScript file for the Chrono-Wizard Timer App.
 * This file uses a class-based, SOLID-inspired approach to manage
 * the stopwatch, countdown, and UI logic separately.
 */

/**
 * ----------------------------------------------------------------
 * UI Class
 * ----------------------------------------------------------------
 * Handles all direct manipulation of the DOM.
 * It reads from and writes to the HTML elements.
 */
class UI {
    constructor() {
        console.log('UI class instantiated.');
        this.selectDOMElements();
        this.bindQuantityInputEvents(); // NEW: Bind events for the + and - buttons
        this.alarmActive = false;
    }

    // Select and store all DOM elements we'll interact with
    selectDOMElements() {
        try {
            // Tabs
            this.tabs = document.querySelectorAll('.tab-btn');
            this.views = {
                stopwatch: document.getElementById('view-stopwatch'),
                countdown: document.getElementById('view-countdown'),
            };

            // Stopwatch
            this.stopwatch = {
                display: document.getElementById('stopwatch-display'),
                startStopBtn: document.getElementById('stopwatch-start-stop'),
                lapBtn: document.getElementById('stopwatch-lap'),
                resetBtn: document.getElementById('stopwatch-reset'),
                lapsContainer: document.getElementById('stopwatch-laps-container'),
                lapsList: document.getElementById('stopwatch-laps-list'),
            };

            // Countdown
            this.countdown = {
                inputView: document.getElementById('countdown-inputs'),
                timerView: document.getElementById('countdown-timer'),
                display: document.getElementById('countdown-display'),

                // NEW: References to the display spans for values
                hoursValue: document.getElementById('cd-hours-value'),
                minutesValue: document.getElementById('cd-minutes-value'),
                secondsValue: document.getElementById('cd-seconds-value'),

                setBtn: document.getElementById('countdown-set'),
                startStopBtn: document.getElementById('countdown-start-stop'),
                resetBtn: document.getElementById('countdown-reset'),
            };

            // Alarm
            this.alarmOverlay = document.getElementById('alarm-overlay');

            // Check if all elements were found
            if (!this.stopwatch.display || !this.countdown.display || !this.tabs.length) {
                throw new Error('A critical UI element is missing from the DOM.');
            }
        } catch (error) {
            console.error('Fatal Error during UI element selection:', error.message);
            alert('Error: Could not initialize the app. A critical page element is missing.');
        }
    }

    // NEW: Binds click events to all + and - buttons
    bindQuantityInputEvents() {
        document.querySelectorAll('.q-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                const unit = e.target.dataset.unit;
                const action = e.target.classList.contains('q-btn-plus') ? 'increment' : 'decrement';
                this.updateQuantity(targetId, unit, action);
            });
        });
    }

    // NEW: Handles the increment/decrement logic for the quantity inputs
    updateQuantity(targetId, unit, action) {
        try {
            const displayElement = document.getElementById(targetId);
            let value = parseInt(displayElement.textContent);
            let max = Infinity;
            let min = 0;

            if (unit === 'minutes' || unit === 'seconds') {
                max = 59;
            }

            if (action === 'increment') {
                value = Math.min(max, value + 1);
            } else if (action === 'decrement') {
                value = Math.max(min, value - 1);
            }

            displayElement.textContent = value;
            console.log(`Updated ${unit}: ${value}`);
        } catch (error) {
            console.error('Error updating quantity input:', error.message);
        }
    }

    // Switch between Stopwatch and Countdown views
    switchView(viewName) {
        Object.values(this.views).forEach(view => view.classList.add('hidden'));
        this.tabs.forEach(tab => {
            if (tab.dataset.view === viewName) {
                tab.classList.remove('inactive-tab');
                tab.classList.add('active-tab');
            } else {
                tab.classList.remove('active-tab');
                tab.classList.add('inactive-tab');
            }
        });
        if (this.views[viewName]) {
            this.views[viewName].classList.remove('hidden');
            console.log(`Switched view to: ${viewName}`);
        } else {
            console.error(`View "${viewName}" does not exist.`);
        }
    }

    // --- Stopwatch UI Methods ---

    updateStopwatchDisplay(timeString) {
        const [main, ms] = timeString.split('.');
        const [hours, minutes, seconds] = main.split(':');
        const displayParts = this.stopwatch.display.children;

        displayParts[0].textContent = hours;
        displayParts[1].textContent = minutes;
        displayParts[2].textContent = seconds;
        displayParts[3].textContent = `.${ms}`;
    }

    updateStopwatchControls(isRunning, hasTime) {
        this.stopwatch.startStopBtn.textContent = isRunning ? 'Stop' : 'Start';
        this.stopwatch.startStopBtn.classList.toggle('btn-red', isRunning);
        this.stopwatch.startStopBtn.classList.toggle('btn-green', !isRunning);

        this.stopwatch.lapBtn.disabled = !isRunning;
        this.stopwatch.resetBtn.disabled = isRunning || !hasTime;
    }

    addLap(lapTime, lapNumber) {
        this.stopwatch.lapsContainer.classList.remove('hidden');
        const li = document.createElement('li');
        li.className = 'border-b border-gray-700 pb-1';
        li.innerHTML = `
            <span class="text-gray-500 mr-2">Lap ${lapNumber}</span>
            <span class="text-white">${lapTime}</span>
        `;
        this.stopwatch.lapsList.prepend(li);
    }

    clearLaps() {
        this.stopwatch.lapsList.innerHTML = '';
        this.stopwatch.lapsContainer.classList.add('hidden');
    }

    // --- Countdown UI Methods ---

    // UPDATED: Reads values from <span> elements
    getCountdownInputs() {
        try {
            const hours = parseInt(this.countdown.hoursValue.textContent) || 0;
            const minutes = parseInt(this.countdown.minutesValue.textContent) || 0;
            const seconds = parseInt(this.countdown.secondsValue.textContent) || 0;

            if (hours < 0 || minutes < 0 || seconds < 0) {
                throw new Error('Negative numbers are not allowed.');
            }
            // Max limit checking is now handled by updateQuantity, but keep a final check
            if (minutes > 59 || seconds > 59) {
                throw new Error('Minutes and seconds cannot be greater than 59.');
            }

            const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;

            if (totalMs <= 0) {
                throw new Error('Total time must be greater than 0.');
            }
            return totalMs;
        } catch (error) {
            console.error(`Invalid countdown input: ${error.message}`);
            alert(`Invalid input: ${error.message}`);
            return null;
        }
    }

    updateCountdownDisplay(timeString) {
        this.countdown.display.textContent = timeString;
    }

    showCountdownInputs() {
        this.countdown.timerView.classList.add('hidden');
        this.countdown.inputView.classList.remove('hidden');
    }

    showCountdownTimer() {
        this.countdown.inputView.classList.add('hidden');
        this.countdown.timerView.classList.remove('hidden');
    }

    updateCountdownControls(isRunning) {
        this.countdown.startStopBtn.textContent = isRunning ? 'Stop' : 'Start';
        this.countdown.startStopBtn.classList.toggle('btn-red', isRunning);
        this.countdown.startStopBtn.classList.toggle('btn-green', !isRunning);

        this.countdown.resetBtn.disabled = isRunning;
    }

    clearCountdownInputs() {
        // UPDATED: Sets the text content of the display spans
        this.countdown.hoursValue.textContent = '0';
        this.countdown.minutesValue.textContent = '8';
        this.countdown.secondsValue.textContent = '0';
    }

// --- Alarm Method ---

    triggerAlarmFlash() {
        if (this.alarmActive) return; // Prevent multiple alarms

        console.log('ALARM: Countdown finished!');
        this.alarmActive = true;
        this.alarmOverlay.classList.remove('hidden');
        this.alarmOverlay.classList.add('alarm-flash');

        // Stop the alarm flash after the animation finishes (3s)
        setTimeout(() => {
            this.alarmOverlay.classList.add('hidden');
            this.alarmOverlay.classList.remove('alarm-flash');
            this.alarmActive = false;
        }, 3000); // 0.5s * 6 flashes = 3s
    }
}

/**
 * ----------------------------------------------------------------
 * Stopwatch Class
 * ----------------------------------------------------------------
 * Manages the logic and state for the stopwatch.
 */
class Stopwatch {
    constructor(ui) {
        this.ui = ui;
        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.laps = [];
        this.timerInterval = null;
        this.animationFrame = null;

        this.bindEvents();
        this.ui.updateStopwatchControls(false, false);
        console.log('Stopwatch class instantiated.');
    }

    bindEvents() {
        this.ui.stopwatch.startStopBtn.addEventListener('click', () => this.handleStartStop());
        this.ui.stopwatch.lapBtn.addEventListener('click', () => this.handleLap());
        this.ui.stopwatch.resetBtn.addEventListener('click', () => this.handleReset());
    }

    handleStartStop() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.start();
        } else {
            this.stop();
        }
        this.ui.updateStopwatchControls(this.isRunning, this.elapsedTime > 0);
    }

    start() {
        console.log('Stopwatch started.');
        this.startTime = Date.now() - this.elapsedTime;

        // Use requestAnimationFrame for smoother display updates
        const update = () => {
            if (!this.isRunning) return;
            this.elapsedTime = Date.now() - this.startTime;
            this.ui.updateStopwatchDisplay(this.formatTime(this.elapsedTime));
            this.animationFrame = requestAnimationFrame(update);
        };
        this.animationFrame = requestAnimationFrame(update);
    }

    stop() {
        console.log('Stopwatch stopped.');
        cancelAnimationFrame(this.animationFrame);
        // Recalculate elapsed time precisely on stop
        this.elapsedTime = Date.now() - this.startTime;
        this.ui.updateStopwatchDisplay(this.formatTime(this.elapsedTime));
    }

    handleLap() {
        if (!this.isRunning) return;
        const lapTime = this.elapsedTime;
        this.laps.push(lapTime);
        const lapNumber = this.laps.length;
        const formattedTime = this.formatTime(lapTime);
        this.ui.addLap(formattedTime, lapNumber);
        console.log(`Lap ${lapNumber}: ${formattedTime}`);
    }

    handleReset() {
        if (this.isRunning) return; // Safety check
        console.log('Stopwatch reset.');
        cancelAnimationFrame(this.animationFrame);

        this.isRunning = false;
        this.startTime = 0;
        this.elapsedTime = 0;
        this.laps = [];

        this.ui.updateStopwatchDisplay('00:00:00.000');
        this.ui.clearLaps();
        this.ui.updateStopwatchControls(false, false);
    }

    // Format milliseconds into HH:MM:SS.mmm
    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        const milliseconds = (ms % 1000).toString().padStart(3, '0');
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
}

/**
 * ----------------------------------------------------------------
 * Countdown Class
 * ----------------------------------------------------------------
 * Manages the logic and state for the countdown timer.
 */
class Countdown {
    constructor(ui) {
        this.ui = ui;
        this.isRunning = false;
        this.targetTime = 0;
        this.remainingTime = 0; // Stores remaining ms when paused
        this.initialDuration = 0; // Stores the initially set duration
        this.timerInterval = null;

        this.bindEvents();
        console.log('Countdown class instantiated.');
    }

    bindEvents() {
        this.ui.countdown.setBtn.addEventListener('click', () => this.handleSet());
        this.ui.countdown.startStopBtn.addEventListener('click', () => this.handleStartStop());
        this.ui.countdown.resetBtn.addEventListener('click', () => this.handleReset());
    }

    handleSet() {
        if (this.isRunning) return;

        const totalMs = this.ui.getCountdownInputs();
        if (totalMs === null || totalMs <= 0) return; // Error handled by UI class

        this.initialDuration = totalMs;
        this.remainingTime = totalMs;
        this.ui.updateCountdownDisplay(this.formatTime(this.remainingTime));
        this.ui.showCountdownTimer();
        this.ui.updateCountdownControls(false);
        console.log(`Countdown set for ${this.formatTime(totalMs)}.`);
    }

    handleStartStop() {
        this.isRunning = !this.isRunning;
        if (this.isRunning) {
            this.start();
        } else {
            this.stop();
        }
        this.ui.updateCountdownControls(this.isRunning);
    }

    start() {
        console.log('Countdown started.');
        // Set target time based on remaining time
        this.targetTime = Date.now() + this.remainingTime;

        // Clear any existing interval
        clearInterval(this.timerInterval);

        // Initial update to prevent 1-second lag
        this.update();

        this.timerInterval = setInterval(() => this.update(), 100);
    }

    stop() {
        console.log('Countdown stopped.');
        clearInterval(this.timerInterval);
        // Store remaining time precisely
        this.remainingTime = Math.max(0, this.targetTime - Date.now());
    }

    update() {
        const now = Date.now();
        this.remainingTime = Math.max(0, this.targetTime - now);

        this.ui.updateCountdownDisplay(this.formatTime(this.remainingTime));

        if (this.remainingTime === 0) {
            this.finish();
        }
    }

    finish() {
        console.log('Countdown finished.');
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.ui.triggerAlarmFlash();
        this.ui.updateCountdownControls(false);
        // Reset remainingTime to the initial duration for a quick restart
        this.remainingTime = this.initialDuration;
    }

    handleReset() {
        if (this.isRunning) return; // Safety check

        console.log('Countdown reset.');
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.targetTime = 0;
        this.remainingTime = 0;
        this.initialDuration = 0;

        this.ui.clearCountdownInputs();
        this.ui.showCountdownInputs();
        this.ui.updateCountdownDisplay('00:08:00'); // Reset display
        this.ui.updateCountdownControls(false);
    }

    // Format milliseconds into HH:MM:SS
    formatTime(ms) {
        // Add 500ms to round to nearest second for display
        const totalSeconds = Math.ceil(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    }
}

/**
 * ----------------------------------------------------------------
 * App Class (Orchestrator)
 * ----------------------------------------------------------------
 * Initializes the application and wires everything together.
 */
class App {
    constructor() {
        try {
            this.ui = new UI();
            this.stopwatch = new Stopwatch(this.ui);
            this.countdown = new Countdown(this.ui);
            this.bindTabEvents();
            this.ui.switchView('stopwatch'); // Default view
            console.log('App initialized successfully.');
        } catch (error) {
            console.error('Failed to initialize App:', error.message);
            document.body.innerHTML = '<h1 style="color:red; text-align:center; margin-top: 50px;">Application failed to load. Check console.</h1>';
        }
    }

    bindTabEvents() {
        this.ui.tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const viewName = e.target.dataset.view;
                this.ui.switchView(viewName);

                // Reset the other timer when switching tabs
                // This mimics the behavior of online-stopwatch.com
                if (viewName === 'stopwatch' && (this.countdown.isRunning || this.countdown.remainingTime > 0)) {
                    this.countdown.handleReset();
                    console.log('Switching to Stopwatch, Countdown reset.');
                } else if (viewName === 'countdown' && (this.stopwatch.isRunning || this.stopwatch.elapsedTime > 0)) {
                    this.stopwatch.handleReset();
                    console.log('Switching to Countdown, Stopwatch reset.');
                }
            });
        });
    }
}

// --- App Entry Point ---
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
});