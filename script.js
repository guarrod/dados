document.addEventListener('DOMContentLoaded', () => {
    const rollButton = document.getElementById('rollButton');
    const resultSpan = document.getElementById('result');
    const launchNumberSpan = document.getElementById('launchNumber');
    const dice1Img = document.getElementById('dice1');
    const dice2Img = document.getElementById('dice2');

    let launchCount = 0;

    const launchSequences = [
        { min: 2, max: 3 },  // 1st launch
        { min: 4, max: 6 },  // 2nd launch
        { min: 7, max: 9 },  // 3rd launch
        { min: 10, max: 12 } // 4th launch
    ];

    const diceImages = [
        "https://upload.wikimedia.org/wikipedia/commons/2/2c/Alea_1.png",
        "https://upload.wikimedia.org/wikipedia/commons/b/b8/Alea_2.png",
        "https://upload.wikimedia.org/wikipedia/commons/2/2f/Alea_3.png",
        "https://upload.wikimedia.org/wikipedia/commons/8/88/Alea_4.png",
        "https://upload.wikimedia.org/wikipedia/commons/5/55/Alea_5.png",
        "https://upload.wikimedia.org/wikipedia/commons/f/f9/Alea_6.png"
    ];

    rollButton.addEventListener('click', () => {
        // Determine the current sequence
        const sequence = launchSequences[launchCount % 4];
        launchCount++;

        // Generate a random target sum within the sequence's range
        const targetSum = Math.floor(Math.random() * (sequence.max - sequence.min + 1)) + sequence.min;

        // Determine the possible range for the first die
        const d1Min = Math.max(1, targetSum - 6);
        const d1Max = Math.min(6, targetSum - 1);

        // Roll the first die
        const d1 = Math.floor(Math.random() * (d1Max - d1Min + 1)) + d1Min;

        // Calculate the second die
        const d2 = targetSum - d1;

        // Update the dice images
        dice1Img.src = diceImages[d1 - 1];
        dice2Img.src = diceImages[d2 - 1];

        // Update the result and launch number
        resultSpan.textContent = targetSum;
        launchNumberSpan.textContent = launchCount;
    });
});
