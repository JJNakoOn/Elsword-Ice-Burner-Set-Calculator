function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(navigator.userAgent);
}

document.addEventListener("DOMContentLoaded", async () => {
    if (isMobileDevice()) {
        const myModal = new bootstrap.Modal(document.getElementById('mobileWarningModal'));
        myModal.show();
    }
    await loadAvailableIceEquipment();
    await loadChangelog();
    initializeFinalAttributes();
    const toggleSections = document.getElementById("toggleSections");
    const iceOptionsSection = document.getElementById("iceOptionsSection");
    const specialEffectsBottom = document.getElementById("specialFXBottom");
    const specialFXRight = document.getElementById("specialFXRight");
    const resetButton = document.getElementById("resetButton");
    const suitEffectsSection = document.getElementById("suitEffectsSection");
    const comparisonControls = document.getElementById("saveForCompareBtn"); 
    const clearCompareBtn = document.getElementById("clearCompareBtn");
    const comparisonHeader = document.getElementById("comparisonHeader"); 
    const comparisonCells = document.querySelectorAll("td[data-comparison]");

    toggleSections.addEventListener("change", () => {
        iceOptionsSection.style.display = toggleSections.checked
            ? "none"
            : "block";
        suitEffectsSection.style.display = toggleSections.checked
            ? "none"
            : "block";
        specialEffectsBottom.style.display = toggleSections.checked
            ? "none"
            : "block";
        specialFXRight.style.display = toggleSections.checked
            ? "block"
            : "none";
        resetButton.style.display = toggleSections.checked
            ? "none"
            : "flex";
            
        if (comparisonControls) {
            comparisonControls.style.display = toggleSections.checked
                ? "none"
                : "inline-block";
        }
        if (clearCompareBtn) {
            clearCompareBtn.style.display = toggleSections.checked
                ? "none"
                : (Object.keys(savedAttributes).length > 0 ? "inline-block" : "none");
        }
        
        const hasComparisonData = Object.keys(savedAttributes).length > 0;
        
        if (comparisonHeader) {
            comparisonHeader.style.display = toggleSections.checked
                ? "none"
                : (hasComparisonData ? "table-cell" : "none");
        }
        
        comparisonCells.forEach(cell => {
            cell.style.display = toggleSections.checked
                ? "none"
                : (hasComparisonData ? "table-cell" : "none");
        });
        
        if (!toggleSections.checked && hasComparisonData) {
            updateComparisonDisplay();
        } else if (toggleSections.checked) {
            document.querySelectorAll('.comparison-indicator').forEach(indicator => {
                indicator.remove();
            });
        }
    });

    iceOptionsSection.style.display = toggleSections.checked
        ? "none"
        : "block";
    suitEffectsSection.style.display = toggleSections.checked
        ? "none"
        : "block";
    specialEffectsBottom.style.display = toggleSections.checked
        ? "none"
        : "block";
    specialFXRight.style.display = toggleSections.checked
        ? "block"
        : "none";
    resetButton.style.display = toggleSections.checked
        ? "none"
        : "flex";
        
    if (comparisonControls) {
        comparisonControls.style.display = toggleSections.checked
            ? "none"
            : "inline-block";
    }

    resetConfirmModal = new bootstrap.Modal(document.getElementById('resetConfirmModal'));

    updateFilteredData();
    displayAvailableIceEquipment();

    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.querySelector('.clear-search-btn');
    
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        currentPage = 1;
        updateFilteredData();
        displayAvailableIceEquipment();
        toggleClearButton();
    });
    
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        updateFilteredData();
        displayAvailableIceEquipment();
        toggleClearButton();
    });

    toggleClearButton();
});



const selectedEquipmentSets = new Set();
const selectedCheckboxes = new Set();
let selectedAttributes = {};
let selectedParts = {};
let suitCounts = {};
let currentPage = 1;
const itemsPerPage = 10;
let allEquipmentData = [];
let searchQuery = '';
let filteredData = [];
let savedAttributes = {};


const attributeList = [
    "雙攻+",
    "雙攻%",
    "致命一擊%",
    "極大化%",
    "動作速度%",
    "適應力%",
    "致命一擊傷害%",
    "技能傷害%",
    "強烈/超越技傷%",
    "-技能冷卻%",
    "兩極化%",
    "流血%",
    "100%血殺%",
    "-MP消耗量%",
    "無視防禦%",
    "HP%",
    "雙防+",
    "移動速度%",
    "跳躍速度%",
    "額外傷害%",
    "傷害減少%",
    "攻擊MP回復%",
    "被擊MP回復%",
    "覺醒回復速度%",
    "覺醒持續時間%",
    "所有屬性抵抗+"
];

function updateFilteredData() {
    if (!searchQuery) {
        filteredData = [...allEquipmentData];
    } else {
        filteredData = allEquipmentData.filter(item => {
            const setNameMatch = item.set.toLowerCase().includes(searchQuery);
            const partsMatch = item.parts.some(part => 
                getPartName(part.part).toLowerCase().includes(searchQuery)
            );
            return setNameMatch || partsMatch;
        });
    }
}

function toggleClearButton() {
    const clearSearchBtn = document.querySelector('.clear-search-btn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput.value.length > 0) {
        clearSearchBtn.classList.add('visible');
    } else {
        clearSearchBtn.classList.remove('visible');
    }
}


function showResetConfirmation() {
    resetConfirmModal.show();
}

function resetAll() {
    Object.keys(selectedParts).forEach(part => {
        clearSelectedPart(part);
    });

    selectedAttributes = {};
    suitCounts = {};

    document.querySelectorAll('.equipment-part').forEach(part => {
        part.classList.remove('selected-part');
        part.classList.remove('selected-suit-part-1', 'selected-suit-part-2', 'selected-suit-part-3');
    });

    const suitEffectsList = document.getElementById('suitEffectsList');
    if (suitEffectsList) {
        const checkboxes = suitEffectsList.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    updateFinalValues();

    const equipmentOptions = document.getElementById('equipmentOptions');
    if (equipmentOptions) {
        equipmentOptions.innerHTML = '';
    }

    const iceOptionsTitle = document.querySelector('.ice-options h3');
    if (iceOptionsTitle) {
        iceOptionsTitle.textContent = '挑選冰裝';
    }

    resetConfirmModal.hide();

    updateSuitEffects();
}

async function loadAvailableIceEquipment() {
    await fetch("./data/allData.json")
        .then((res) => res.json())
        .then((data) => (allEquipmentData = data));

    //allEquipmentData = generateMockData(25);
    allEquipmentData.forEach((setData, setIndex) => {
        setData.parts.forEach((part, partIndex) => {
            part.attributes.id = `equip_${setIndex + 1}_${partIndex}`;
            part.setName = setData.set;
        });
    });
    displayAvailableIceEquipment();
}

async function loadChangelog() {
    try {
        const response = await fetch("./data/changeLog.json");
        const changeLogData = await response.json();

        const changelogContent = document.getElementById('changelogContent');
        changeLogData.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'changelog-entry';

            const date = new Date(entry.date);
            const formattedDate = date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            entryElement.innerHTML = `
                <div class="changelog-date">${formattedDate}</div>
                <div class="changelog-content">
                    <ul>
                        ${entry.changes.map(change => `<li>${change}</li>`).join('')}
                    </ul>
                </div>
            `;

            changelogContent.appendChild(entryElement);
        });
    } catch (error) {
        console.error('Error loading changelog:', error);
        const changelogContent = document.getElementById('changelogContent');
        changelogContent.innerHTML = '<p class="text-danger">載入更新日誌時發生錯誤</p>';
    }
}

function initializeFinalAttributes() {
    const finalAttributes = document.getElementById("finalAttributes");
    finalAttributes.innerHTML = "";
    
    const thead = document.getElementById("finalValueTable").querySelector("thead tr");
    if (thead.children.length < 3) {
        const comparisonHeader = document.createElement("th");
        comparisonHeader.textContent = "比較數值";
        comparisonHeader.id = "comparisonHeader";
        comparisonHeader.style.display = "none";
        thead.appendChild(comparisonHeader);
    }
    
    attributeList.forEach((attr) => {
        const row = finalAttributes.insertRow();
        const nameCell = row.insertCell(0);
        const valueCell = row.insertCell(1);
        nameCell.textContent = attr;
        valueCell.textContent = "-";
        valueCell.setAttribute("data-attribute", attr);
        
        const comparisonCell = row.insertCell(2);
        comparisonCell.textContent = "-";
        comparisonCell.setAttribute("data-comparison", attr);
        comparisonCell.style.display = "none";
    });
    
    addCompareButton();
}

function addCompareButton() {
    const finalValuesHeader = document.querySelector(".final-values h3");
    
    if (!document.getElementById("saveForCompareBtn")) {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "d-flex justify-content-between align-items-center w-100";
        
        const headerTitle = document.createElement("h3");
        headerTitle.textContent = finalValuesHeader.textContent;
        buttonContainer.appendChild(headerTitle);
        
        const btnGroup = document.createElement("div");
        btnGroup.className = "btn-group";
        
        const saveButton = document.createElement("button");
        saveButton.id = "saveForCompareBtn";
        saveButton.className = "btn btn-primary btn-sm";
        saveButton.innerHTML = "新增比較";
        saveButton.onclick = saveCurrentValues;
        
        const clearButton = document.createElement("button");
        clearButton.id = "clearCompareBtn";
        clearButton.className = "btn btn-outline-secondary btn-sm";
        clearButton.innerHTML = "清除比較";
        clearButton.onclick = clearComparison;
        clearButton.style.display = "none";
        
        btnGroup.appendChild(saveButton);
        btnGroup.appendChild(clearButton);
        buttonContainer.appendChild(btnGroup);
        
        finalValuesHeader.parentNode.replaceChild(buttonContainer, finalValuesHeader);
    }
}

function clearComparison() {
    savedAttributes = {};
    
    document.querySelectorAll("td[data-comparison]").forEach(cell => {
        cell.style.display = "none";
    });
    document.getElementById("comparisonHeader").style.display = "none";
    document.querySelectorAll(".comparison-indicator").forEach(el => el.remove());
    document.getElementById("saveForCompareBtn").innerHTML = "新增比較";
    document.getElementById("clearCompareBtn").style.display = "none";
}

function saveCurrentValues() {
    savedAttributes = {};
    const attributeCells = document.querySelectorAll("td[data-attribute]");
    
    attributeCells.forEach((cell) => {
        const attr = cell.getAttribute("data-attribute");
        const value = cell.textContent;
        savedAttributes[attr] = value === "-" ? 0 : parseFloat(value);
    });
    
    document.querySelectorAll("td[data-comparison]").forEach(cell => {
        cell.style.display = "table-cell";
    });
    document.getElementById("comparisonHeader").style.display = "table-cell";
    
    updateComparisonDisplay();
    
    document.getElementById("clearCompareBtn").style.display = "inline-block";
    document.getElementById("saveForCompareBtn").innerHTML = "更新比較";
}

function generateMockData(count) {
    const attributesPool = [
        "雙攻+",
        "雙攻%",
        "HP+",
        "極大化%",
        "技能傷害%",
        "流血%",
        "致命一擊%",
        "動作速度%",
        "適應力%"
    ];
    const partTypes = [
        "weapon",
        "accessoryWeapon",
        "support",
        "faceTop",
        "faceMiddle",
        "faceBottom",
        "necklace",
        "accessoryUpper",
        "accessoryLower",
        "arm",
        "earring",
        "ring"
    ];
    const data = [];

    for (let i = 1; i <= count; i++) {
        const suitPartsCount = Math.floor(Math.random() * 2) + 5;
        const selectedParts = [];

        while (selectedParts.length < suitPartsCount) {
            const randomIndex = Math.floor(Math.random() * partTypes.length);
            const randomPart = partTypes[randomIndex];
            if (!selectedParts.includes(randomPart)) {
                selectedParts.push(randomPart);
            }
        }

        const parts = selectedParts.map((part, index) => {
            const selectedAttributes = [];
            const randomAttributes = [...attributesPool]
                .sort(() => Math.random() - 0.5)
                .slice(0, 2);
            randomAttributes.forEach((attr) => {
                selectedAttributes.push({
                    attribute: attr,
                    value: Math.floor(Math.random() * 20) + 5
                });
            });

            return {
                part: part,
                name: `冰裝 ${i} - ${getPartName(part)}`,
                attributes: {
                    attrList: selectedAttributes,
                },
            };
        });

        data.push({
            set: `冰裝套裝 ${i}`,
            parts: parts,
            suitEffects: [
                {
                    pieces: 2,
                    effects: [
                        { attribute: "動作速度%", value: 5 },
                        { attribute: "流血%", value: 6 },
                    ],
                },
                {
                    pieces: 3,
                    effects: [
                        { attribute: "移動速度%", value: 10 },
                        { attribute: "-MP消耗量%", value: 5 },
                        {
                            description: "使用特殊主動技能時3%機率發動[贖罪的代價]效果",
                        },
                    ],
                },
            ],
        });
    }
    return data;
}

function selectAllEquipment() {
    filteredData.forEach((item) => {
        const index = allEquipmentData.indexOf(item);
        selectedCheckboxes.add(index);
    });
    displayAvailableIceEquipment();
}

function deselectAllEquipment() {
    filteredData.forEach((item) => {
        const index = allEquipmentData.indexOf(item);
        selectedCheckboxes.delete(index);
    });
    displayAvailableIceEquipment();
}

function displayAvailableIceEquipment() {
    const container = document.getElementById("availableEquipment");
    container.innerHTML = "";

    const paginatedData = paginateData(
        filteredData,
        currentPage,
        itemsPerPage
    );
    const list = document.createElement("ul");
    list.className = "list-group";

    paginatedData.forEach((item, index) => {
        const listItem = document.createElement("li");
        listItem.className = "list-group-item";
        const globalIndex = allEquipmentData.indexOf(item);

        const partsList = item.parts
            .map((part) => getPartName(part.part))
            .join("、");
        const costumePostfix = item.isCostume !== undefined ? "(時裝)" : ""
        listItem.innerHTML = `<input type="checkbox" id="equip_${globalIndex}" value="${globalIndex}" ${selectedCheckboxes.has(globalIndex) ? "checked" : ""
            }>
                        <label for="equip_${globalIndex}" class="ms-2"><a href=${item.link} target=${item.link === "#"?"":"_blank"}><b>${item.set
            }${costumePostfix}</b></a>－${partsList}</label>`;

        listItem.querySelector("input").addEventListener("change", (e) => {
            if (e.target.checked) {
                selectedCheckboxes.add(globalIndex);
            } else {
                selectedCheckboxes.delete(globalIndex);
            }

            const setData = allEquipmentData[globalIndex];
            if (selectedEquipmentSets.has(setData.set)) {
                selectedEquipmentSets.delete(setData.set);
                setData.parts.forEach((part) => {
                    if (selectedParts[part.part]) {
                        selectedParts[part.part] = selectedParts[part.part].filter(
                            (p) => p.setName !== setData.set
                        );
                        if (selectedParts[part.part].length === 0) {
                            delete selectedParts[part.part];
                        }
                    }
                });
            }
        });
        list.appendChild(listItem);
    });

    container.appendChild(list);
    updatePagination();
}

function paginateData(data, page, itemsPerPage) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
}

function updatePagination() {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = `btn btn-primary ${i === currentPage ? "active" : ""}`;
        button.onclick = () => {
            currentPage = i;
            displayAvailableIceEquipment();
        };
        pagination.appendChild(button);
    }
}

function importSelectedEquipment() {
    selectedEquipmentSets.clear();
    selectedParts = {};
    selectedCheckboxes.forEach((globalIndex) => {
        const setData = allEquipmentData[globalIndex];
        if (!selectedEquipmentSets.has(setData.set)) {
            selectedEquipmentSets.add(setData.set);
            setData.parts.forEach((part) => {
                if (!selectedParts[part.part]) {
                    selectedParts[part.part] = [];
                }
                selectedParts[part.part].push(part);
            });
        }
    });

    displayAvailableIceEquipment();
    updateSuitEffects();
    openTab(
        "setupTab",
        document.querySelector('.nav-link[onclick*="setupTab"]')
    );
}

function selectPart(part) {
    const availableParts = selectedParts[part] || [];
    const equipmentOptions = document.getElementById("equipmentOptions");
    equipmentOptions.innerHTML = "";

    const iceOptionsTitle = document.querySelector(".ice-options h3");
    if (part) {
        iceOptionsTitle.textContent = `挑選冰裝－${getPartName(part)}`;
    } else {
        iceOptionsTitle.textContent = "挑選冰裝";
    }

    const noOption = document.createElement("label");
    noOption.className = "d-block";
    noOption.innerHTML = `<input type="radio" name="${part}" value="無" onclick="clearSelectedPart('${part}')"> 無`;
    equipmentOptions.appendChild(noOption);

    availableParts.forEach((item) => {
        const label = document.createElement("label");
        label.className = "d-block";

        let itemHTML = `<input type="radio" name="${part}" value="${item.name
            }" onclick="updateSelectedPart('${part}', '${item.name}', '${item.attributes.id
            }', '${item.setName}')" ${selectedAttributes[part]?.name === item.name ? "checked" : ""
            }> <b>${item.name}</b> <br>(`;
        item.attributes.attrList.forEach((attr, index) => {
            if (attr.attribute !== undefined)
                itemHTML += getAttritubeValueName(attr.attribute, attr.value);
            else itemHTML += `${attr.description}`;

            if (index < item.attributes.attrList.length - 1) {
                itemHTML += ", ";
            }
        });
        itemHTML += ")";

        label.innerHTML = itemHTML;
        equipmentOptions.appendChild(label);
    });
}

function clearSelectedPart(part) {
    const targetCell = document.getElementById(part);
    if (targetCell) {
        targetCell.innerHTML = `<span class="part-name">${getPartName(
            part
        )}</span>`;
        targetCell.classList.remove("selected-part");
    }

    if (selectedAttributes[part]) {
        const setId = selectedAttributes[part].attributes.id.split("_")[1];
        const setName = selectedAttributes[part].setName;

        if (suitCounts[setName] > 0) {
            suitCounts[setName]--;

            let otherPartsSelected = false;
            for (const p in selectedAttributes) {
                if (
                    p !== part &&
                    selectedAttributes[p]?.attributes?.id.startsWith(
                        `equip_${setId}_`
                    )
                ) {
                    otherPartsSelected = true;
                    break;
                }
            }

            if (!otherPartsSelected) {
                delete suitCounts[setName];
            }
        }
    }

    delete selectedAttributes[part];
    updateFinalValues();
    removeZeroCountSuits();
    applySuitEffectClasses();
}

function updateSelectedPart(
    part,
    itemName,
    attributesId,
    currentSetName
) {
    const targetCell = document.getElementById(part);
    if (targetCell) {
        targetCell.innerHTML = `<span class="part-name">${getPartName(
            part
        )}<br>${currentSetName}</span>`;
        targetCell.classList.add("selected-part");
    }

    if (selectedAttributes[part]) {
        const prevSetId =
            selectedAttributes[part].attributes.id.split("_")[1];
        const prevSetName = selectedAttributes[part].setName;
        if (suitCounts[prevSetName] > 0) {
            suitCounts[prevSetName]--;
            let otherPartsSelected = false;
            for (const p in selectedAttributes) {
                if (
                    p !== part &&
                    selectedAttributes[p]?.attributes?.id.startsWith(
                        `equip_${prevSetId}_`
                    )
                ) {
                    otherPartsSelected = true;
                    break;
                }
            }
            if (!otherPartsSelected) {
                delete suitCounts[prevSetName];
            }
        }
    }

    const parsedAttributes = allEquipmentData
        .find((set) =>
            set.parts.find((p) => p.attributes.id === attributesId)
        )
        .parts.find((p) => p.attributes.id === attributesId).attributes;
    selectedAttributes[part] = {
        name: itemName,
        attributes: parsedAttributes,
        setName: currentSetName,
    };

    if (!suitCounts[currentSetName]) {
        suitCounts[currentSetName] = 0;
    }
    suitCounts[currentSetName]++;

    updateFinalValues();
    removeZeroCountSuits();
    applySuitEffectClasses();
}

function removeZeroCountSuits() {
    for (const setName in suitCounts) {
        if (suitCounts[setName] === 0) {
            delete suitCounts[setName];
        }
    }
    updateSuitEffects();
}

function getPartName(part) {
    const partNames = {
        weapon: "武器",
        accessoryWeapon: "飾品(武器)",
        support: "支援",
        faceTop: "臉上",
        faceMiddle: "臉中",
        faceBottom: "臉下",
        accessoryUpper: "飾品 (上衣)",
        accessoryLower: "飾品 (下衣)",
        arm: "手臂",
        earring: "耳環",
        necklace: "項鍊",
        ring: "戒指"
    };
    return partNames[part] || part;
}

function getAttritubeValueName(attribute, value) {
    const purePluses = [
        "雙攻",
        "雙防",
        "所有屬性抵抗"
    ]
    for (const idx in purePluses)
        if (attribute === `${purePluses[idx]}+`)
            return `${attribute}${value}`

    const percentagePluses = [
        "致命一擊",
        "極大化",
        "動作速度",
        "適應力",
        "致命一擊傷害",
        "技能傷害",
        "強烈/超越技傷",
        "移動速度",
        "跳躍速度",
        "額外傷害",
        "傷害減少",
        "攻擊MP回復",
        "被擊MP回復",
        "覺醒回復速度",
        "覺醒持續時間",
        "雙攻",
        "HP",
        "100%血殺",
        "兩極化",
        "流血",
        "無視防禦"
    ]
    for (const idx in percentagePluses)
        if (attribute === `${percentagePluses[idx]}%`)
            return `${percentagePluses[idx]}+${value}%`

    const percentageMinuses = [
        "MP消耗量",
        "技能冷卻"
    ]
    for (const idx in percentageMinuses)
        if (attribute === `-${percentageMinuses[idx]}%`)
            return `${percentageMinuses[idx]}-${value}%`

    return `${attribute}：${value}`

}

function processDescriptionWithBrackets(description, link) {
    const bracketRegex = /\[(.*?)\]/g;
    return description.replace(bracketRegex, (match, content) => {
        return `<a href="${link}#proper_effect" target="_blank">${match}</a>`;
    });
}

function updateFinalValues() {
    const finalAttributes = document.getElementById("finalAttributes");
    const attributeCells = finalAttributes.querySelectorAll("td[data-attribute]");

    const attributeTotals = {};
    const specialEffects = [];
    attributeList.forEach((attr) => (attributeTotals[attr] = 0));

    Object.values(selectedAttributes).forEach((attr) => {
        attr.attributes.attrList.forEach((a) => {
            if (attributeTotals[a.attribute] !== undefined) {
                attributeTotals[a.attribute] += a.value;
            } else if (a.description) {
                specialEffects.push(a.description);
            }
        });
    });

    const selectedSuitEffects = document.querySelectorAll(
        `#suitEffectsList input[type="checkbox"]:checked`
    );
    const suitEffects = {};

    selectedSuitEffects.forEach((cb) => {
        const setName = cb.value;
        const maxPieces = parseInt(cb.dataset.pieces);
        const effectId = `${setName}-${maxPieces}`;

        if (!suitEffects[effectId]) {
            suitEffects[effectId] = { count: 0, effect: null };
        }

        suitEffects[effectId].count = suitCounts[setName] || 0;

        if (!suitEffects[effectId].effect) {
            const setData = allEquipmentData.find((set) => set.set === setName);
            if (setData) {
                suitEffects[effectId].effect = setData.suitEffects.filter(
                    (effectSet) => effectSet.pieces <= maxPieces
                );
            }
        }
    });

    for (const effectId in suitEffects) {
        const { count, effect } = suitEffects[effectId];

        if (effect) {
            effect.forEach((effectSet) => {
                if (count >= effectSet.pieces) {
                    effectSet.effects.forEach((eff) => {
                        if (attributeTotals[eff.attribute] !== undefined) {
                            attributeTotals[eff.attribute] += eff.value;
                        } else {
                            const setName = effectId.split('-')[0];
                            const setData = allEquipmentData.find(set => set.set === setName);
                            const processedDescription = processDescriptionWithBrackets(eff.description, setData?.link || '#');
                            specialEffects.push(processedDescription);
                        }
                    });
                }
            });
        }
    }

    attributeCells.forEach((cell) => {
        const attr = cell.getAttribute("data-attribute");
        cell.textContent = attributeTotals[attr] === 0 ? "-" : attributeTotals[attr];
        
        const indicator = cell.querySelector('.comparison-indicator');
        if (indicator) {
            indicator.remove();
        }
    });
    
    if (Object.keys(savedAttributes).length > 0) {
        updateComparisonDisplay();
    }
    
    const specialEffectsList = document.getElementById("specialEffectsList");
    specialEffectsList.innerHTML = "";
    const specialEffectsListRight = document.getElementById("specialEffectsListRight");
    specialEffectsListRight.innerHTML = "";

    specialEffects.forEach((effect) => {
        const listItem = document.createElement("li");
        listItem.innerHTML = effect;
        specialEffectsList.appendChild(listItem);
        const listItemRight = document.createElement("li");
        listItemRight.innerHTML = effect;
        specialEffectsListRight.appendChild(listItemRight);
    });
}

function updateSuitEffects() {
    const suitEffectsList = document.getElementById("suitEffectsList");
    const checkedSets = new Set();
    const maxAllowedChecks = 3;

    suitEffectsList
        .querySelectorAll('input[type="checkbox"]:checked')
        .forEach((cb) => {
            checkedSets.add(cb.value);
        });

    suitEffectsList.innerHTML = "";

    const displayedSets = new Set();

    for (const setName in suitCounts) {
        if (displayedSets.has(setName)) continue;
        displayedSets.add(setName);

        const count = suitCounts[setName];
        const setData = allEquipmentData.find((set) => set.set === setName);

        if (setData && setData.suitEffects.length > 0) {
            const listItem = document.createElement("li");
            listItem.className = "checkbox-list-item";

            const maxPieces = Math.max(
                ...setData.suitEffects.map((effectSet) => effectSet.pieces)
            );
            const uniqueId = `${setName}-${maxPieces}-${Date.now()}`;

            let effectsHTML = `<input type="checkbox" id="${uniqueId}" value="${setName}" data-pieces="${maxPieces}"> <label class="suit-effect-content" for="${uniqueId}"><b>${setName} (已穿 ${count} 件)</b><br>`;

            const sortedEffects = [...setData.suitEffects].sort(
                (a, b) => a.pieces - b.pieces
            );

            sortedEffects.forEach((effectSet) => {
                effectsHTML += `${effectSet.pieces} 件效果－`;
                effectSet.effects.forEach((effect, index) => {
                    if (effect.attribute !== undefined)
                        effectsHTML += getAttritubeValueName(effect.attribute, effect.value);
                    else
                        effectsHTML += processDescriptionWithBrackets(effect.description, setData.link);
                    if (index < effectSet.effects.length - 1) {
                        effectsHTML += ", ";
                    }
                });
                effectsHTML += "<br>";
            });
            effectsHTML += "</label>";

            listItem.innerHTML = effectsHTML;
            suitEffectsList.appendChild(listItem);

            const checkBox = listItem.querySelector('input[type="checkbox"]');

            const minPieces = Math.min(
                ...setData.suitEffects.map((effectSet) => effectSet.pieces)
            );
            if (count < minPieces) {
                checkBox.disabled = true;
                checkedSets.delete(setName);
            } else {
                checkBox.disabled = false;
            }

            if (checkedSets.has(setName)) {
                checkBox.checked = true;
            }

            checkBox.addEventListener("change", () => {
                const checkedCount = suitEffectsList.querySelectorAll(
                    'input[type="checkbox"]:checked'
                ).length;
                if (checkedCount > maxAllowedChecks) {
                    alert(`最多只能選擇 ${maxAllowedChecks} 個套裝效果`);
                    checkBox.checked = false;
                } else {
                    updateFinalValues();
                    applySuitEffectClasses();
                }
            });
        }
    }
}

function updateComparisonDisplay() {
    document.querySelectorAll('.comparison-indicator').forEach(indicator => {
        indicator.remove();
    });
    
    const attributeCells = document.querySelectorAll("td[data-attribute]");
    const comparisonCells = document.querySelectorAll("td[data-comparison]");
    
    attributeCells.forEach((cell) => {
        const attr = cell.getAttribute("data-attribute");
        const currentValue = cell.textContent === "-" ? 0 : parseFloat(cell.textContent);
        const savedValue = savedAttributes[attr] || 0;
        
        const comparisonCell = document.querySelector(`td[data-comparison="${attr}"]`);
        if (comparisonCell) {
            comparisonCell.textContent = savedValue === 0 ? "-" : savedValue;
        }
        
        const diff = currentValue - savedValue;
        
        if (diff !== 0) {
            const indicator = document.createElement("span");
            indicator.className = "comparison-indicator";
            
            if (diff > 0) {
                indicator.innerHTML = "▲";
                indicator.style.color = "red";
            } else {
                indicator.innerHTML = "▼";
                indicator.style.color = "blue";
            }
            
            cell.appendChild(indicator);
        }
    });
}

function applySuitEffectClasses() {
    document.querySelectorAll('.equipment-part').forEach(part => {
        part.classList.remove('selected-suit-part-1', 'selected-suit-part-2', 'selected-suit-part-3');
    });

    const checkedSets = document.querySelectorAll('#suitEffectsList input[type="checkbox"]:checked');
    checkedSets.forEach((cb, index) => {
        const setName = cb.value;
        const setData = allEquipmentData.find(set => set.set === setName);
        if (setData) {
            setData.parts.forEach(part => {
                const equipmentPart = document.getElementById(part.part);
                if (selectedAttributes[part.part] && selectedAttributes[part.part].setName === setName) {
                    if (equipmentPart) {
                        equipmentPart.classList.add(`selected-suit-part-${index + 1}`);
                    }
                }
            });
        }
    });
}

function openTab(tabId, clickedButton) {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach((tab) => tab.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");

    const navButtons = document.querySelectorAll(".nav-link");
    navButtons.forEach((button) => button.classList.remove("active"));
    clickedButton.classList.add("active");
}