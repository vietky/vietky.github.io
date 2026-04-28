export function setupCrossword(container: HTMLElement) {
    const wrapper = document.createElement('div');
    wrapper.className = "flex flex-col items-center bg-gray-100 p-4 sm:p-8 rounded-lg shadow-xl w-full max-w-5xl mx-auto max-h-[85vh] overflow-y-auto";
    container.appendChild(wrapper);

    const title = document.createElement('h2');
    title.className = "text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 text-center";
    title.innerText = "Tech Stack Crossword";
    wrapper.appendChild(title);

    const mainContainer = document.createElement('div');
    mainContainer.className = "flex flex-col lg:flex-row gap-4 sm:gap-8 w-full min-h-0";
    wrapper.appendChild(mainContainer);

    const gridContainerWrapper = document.createElement('div');
    gridContainerWrapper.className = "flex-1 overflow-auto bg-gray-50 rounded p-2 flex justify-center";
    mainContainer.appendChild(gridContainerWrapper);

    const gridContainer = document.createElement('div');
    gridContainer.className = "grid gap-0.5 sm:gap-1 bg-gray-300 p-1 sm:p-2 rounded w-max mx-auto h-max";
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

    gridContainer.style.gridTemplateColumns = `repeat(${numCols}, minmax(24px, 36px))`;

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
            cell.className = "aspect-square flex items-center justify-center relative";

            if (cellData.char !== '') {
                cell.className += " bg-white border border-gray-400";

                if (cellData.cellNum) {
                    const numLabel = document.createElement('span');
                    numLabel.className = "absolute top-0 left-0.5 text-[8px] sm:text-[10px] text-gray-500 font-bold z-10 pointer-events-none";
                    numLabel.innerText = cellData.cellNum.toString();
                    cell.appendChild(numLabel);
                }

                const input = document.createElement('input');
                input.type = "text";
                input.maxLength = 1;
                input.className = "w-full h-full text-center text-sm sm:text-base md:text-lg font-bold uppercase bg-transparent outline-none focus:bg-blue-100 transition-colors p-0";
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
    cluesContainer.className = "flex-1 mt-4 lg:mt-0 bg-white p-4 sm:p-6 rounded shadow-md overflow-y-auto min-h-[200px] max-h-[50vh] lg:max-h-full";

    const cluesTitleContainer = document.createElement('div');
    cluesTitleContainer.className = "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-2 gap-2";

    const cluesTitle = document.createElement('h3');
    cluesTitle.className = "text-lg sm:text-xl font-bold";
    cluesTitle.innerText = "Clues";
    cluesTitleContainer.appendChild(cluesTitle);

    const actionButtonsContainer = document.createElement('div');
    actionButtonsContainer.className = "flex space-x-2 w-full sm:w-auto justify-end";

    const revealAllBtn = document.createElement('button');
    revealAllBtn.className = "bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600";
    revealAllBtn.innerText = "Reveal All";
    actionButtonsContainer.appendChild(revealAllBtn);

    const resetBtn = document.createElement('button');
    resetBtn.className = "bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600";
    resetBtn.innerText = "Reset";
    actionButtonsContainer.appendChild(resetBtn);

    cluesTitleContainer.appendChild(actionButtonsContainer);
    cluesContainer.appendChild(cluesTitleContainer);

    const cluesList = document.createElement('ul');
    cluesList.className = "space-y-3 text-gray-700 text-xs sm:text-sm md:text-base";

    safeWords.forEach(w => {
        const li = document.createElement('li');
        li.className = "flex flex-col sm:flex-row sm:justify-between sm:items-center py-1 border-b border-gray-100 last:border-0";

        const textSpan = document.createElement('span');
        textSpan.className = "mb-1 sm:mb-0";
        textSpan.innerHTML = `<span class="font-bold mr-1 text-blue-600">${w.id}. ${w.dir === 'H' ? 'Across' : 'Down'}:</span> ${w.clue}`;
        li.appendChild(textSpan);

        const revealBtn = document.createElement('button');
        revealBtn.className = "shrink-0 mt-1 sm:mt-0 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded transition-colors w-fit";
        revealBtn.innerText = "Reveal";
        revealBtn.onclick = () => {
            let r = w.row;
            let c = w.col;
            for (let i = 0; i < w.word.length; i++) {
                const input = inputs.find(inp => inp.dataset.row === r.toString() && inp.dataset.col === c.toString());
                if (input) {
                    input.value = input.dataset.ans!;
                    input.classList.add('text-green-600');
                    input.classList.remove('text-red-600');
                }
                if (w.dir === 'H') c++;
                else r++;
            }
            checkCompletion();
        };
        li.appendChild(revealBtn);

        cluesList.appendChild(li);
    });

    cluesContainer.appendChild(cluesList);
    mainContainer.appendChild(cluesContainer);

    const completionMsg = document.createElement('div');
    completionMsg.className = "mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-green-600 hidden text-center w-full";
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
            // Re-enable inputs if they were previously disabled (e.g., after reset)
            inputs.forEach(i => i.disabled = false);
        }
    }

    revealAllBtn.onclick = () => {
        inputs.forEach(i => {
            i.value = i.dataset.ans!;
            i.classList.add('text-green-600');
            i.classList.remove('text-red-600');
        });
        checkCompletion();
    };

    resetBtn.onclick = () => {
        inputs.forEach(i => {
            i.value = '';
            i.classList.remove('text-green-600', 'text-red-600');
        });
        checkCompletion();
    };
}
