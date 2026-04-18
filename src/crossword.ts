export function setupCrossword(container: HTMLElement) {
    const wrapper = document.createElement('div');
    wrapper.className = "flex flex-col items-center justify-center bg-gray-100 p-8 rounded-lg shadow-xl w-full max-w-5xl mx-auto";
    container.appendChild(wrapper);

    const title = document.createElement('h2');
    title.className = "text-3xl font-bold mb-6 text-gray-800";
    title.innerText = "Tech Stack Crossword";
    wrapper.appendChild(title);

    const mainContainer = document.createElement('div');
    mainContainer.className = "flex flex-col md:flex-row gap-8 w-full";
    wrapper.appendChild(mainContainer);

    const gridContainerWrapper = document.createElement('div');
    gridContainerWrapper.className = "flex-1 overflow-x-auto";
    mainContainer.appendChild(gridContainerWrapper);

    const gridContainer = document.createElement('div');
    gridContainer.className = "grid gap-1 min-w-max bg-gray-300 p-2 rounded";
    gridContainerWrapper.appendChild(gridContainer);

    const safeWords = [
        { id: 1, word: "NODEJS", row: 0, col: 4, dir: "V", clue: "JavaScript runtime built on V8" },
        { id: 2, word: "DOCKER", row: 2, col: 3, dir: "H", clue: "Containerization platform" },
        { id: 3, word: "REDIS", row: 5, col: 0, dir: "H", clue: "In-memory data structure store" },
        { id: 4, word: "GOLANG", row: 0, col: 10, dir: "V", clue: "Statically typed compiled language" },
        { id: 5, word: "PROMETHEUS", row: 7, col: 0, dir: "H", clue: "Monitoring & time series database" },
        { id: 6, word: "KAFKA", row: 5, col: 12, dir: "V", clue: "Distributed event streaming platform" },
        { id: 7, word: "KUBERNETES", row: 9, col: 2, dir: "H", clue: "Container orchestration system" },
    ];

    const numRows = 12;
    const numCols = 14;

    gridContainer.style.gridTemplateColumns = `repeat(${numCols}, minmax(0, 3rem))`;

    const grid: { char: string, cellNum?: number }[][] = Array.from({ length: numRows }, () =>
        Array(numCols).fill({ char: '' })
    );

    safeWords.forEach(w => {
        let r = w.row;
        let c = w.col;
        grid[r][c] = { ...grid[r][c], cellNum: w.id };

        for (let i = 0; i < w.word.length; i++) {
            grid[r][c] = { ...grid[r][c], char: w.word[i] };
            if (w.dir === 'H') c++;
            else r++;
        }
    });

    const inputs: HTMLInputElement[] = [];

    for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
            const cellData = grid[r][c];
            const cell = document.createElement('div');
            cell.className = "w-10 h-10 md:w-12 md:h-12 flex items-center justify-center relative";

            if (cellData.char !== '') {
                cell.className += " bg-white border border-gray-400";

                if (cellData.cellNum) {
                    const numLabel = document.createElement('span');
                    numLabel.className = "absolute top-0 left-1 text-[10px] text-gray-500 font-bold z-10 pointer-events-none";
                    numLabel.innerText = cellData.cellNum.toString();
                    cell.appendChild(numLabel);
                }

                const input = document.createElement('input');
                input.type = "text";
                input.maxLength = 1;
                input.className = "w-full h-full text-center text-lg md:text-xl font-bold uppercase bg-transparent outline-none focus:bg-blue-100 transition-colors";
                input.dataset.row = r.toString();
                input.dataset.col = c.toString();
                input.dataset.ans = cellData.char;
                cell.appendChild(input);
                inputs.push(input);

                input.addEventListener('input', (e) => {
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.toUpperCase();

                    if (target.value === target.dataset.ans) {
                        target.classList.add('text-green-600');
                        target.classList.remove('text-red-600');
                    } else if (target.value !== '') {
                        target.classList.add('text-red-600');
                        target.classList.remove('text-green-600');
                    } else {
                        target.classList.remove('text-green-600', 'text-red-600');
                    }

                    checkCompletion();
                });

            } else {
                cell.className += " bg-transparent";
            }
            gridContainer.appendChild(cell);
        }
    }

    const cluesContainer = document.createElement('div');
    cluesContainer.className = "flex-1 mt-8 md:mt-0 bg-white p-6 rounded shadow-md h-fit";

    const cluesTitle = document.createElement('h3');
    cluesTitle.className = "text-xl font-bold mb-4 border-b pb-2";
    cluesTitle.innerText = "Clues";
    cluesContainer.appendChild(cluesTitle);

    const cluesList = document.createElement('ul');
    cluesList.className = "space-y-3 text-gray-700 text-sm md:text-base";

    safeWords.forEach(w => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="font-bold mr-2 text-blue-600">${w.id}. ${w.dir === 'H' ? 'Across' : 'Down'}:</span> ${w.clue}`;
        cluesList.appendChild(li);
    });

    cluesContainer.appendChild(cluesList);
    mainContainer.appendChild(cluesContainer);

    const completionMsg = document.createElement('div');
    completionMsg.className = "mt-6 text-2xl font-bold text-green-600 hidden text-center w-full";
    completionMsg.innerText = "🎉 All Correct! You know the stack! 🎉";
    wrapper.appendChild(completionMsg);

    function checkCompletion() {
        const allFilled = inputs.every(i => i.value !== '');
        const allCorrect = inputs.every(i => i.value === i.dataset.ans);

        if (allFilled && allCorrect) {
            completionMsg.classList.remove('hidden');
            inputs.forEach(i => i.disabled = true);
        } else {
            completionMsg.classList.add('hidden');
        }
    }
}
