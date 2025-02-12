import requests
import json
import re
import ast
from bs4 import BeautifulSoup

zh2enMap = {
    "武器": "weapon",
    "飾品(武器)": "accessoryWeapon",
    "飾品(支援)": "support",
    "飾品(臉上)": "faceTop",
    "飾品(臉中)": "faceMiddle",
    "飾品(臉下)": "faceBottom",
    "飾品(上衣)": "accessoryUpper",
    "飾品(下衣)": "accessoryLower",
    "飾品(手臂)": "arm",
    "飾品(耳環)": "earring",
    "飾品(項鍊)": "necklace",
    "飾品(戒指物理)": "ring",
}


def searchPercentagePlus(ability, attribute, text):
    pattern = rf"{ability}\+([\d.]+)%"  # 使用 f-string 創建正則表達式
    match = re.search(pattern, text)
    if match:
        return {"attribute": attribute, "value": ast.literal_eval(match.group(1))}


def parseEffect(text):

    percentagePlusList = [
        "致命一擊",
        "極大化",
        "動作速度",
        "適應力",
        "致命一擊傷害",
        "技能傷害",
        "移動速度",
        "跳躍速度",
        "額外傷害",
        "傷害減少",
        "攻擊MP回復",
        "被擊MP回復",
        "覺醒回復速度",
        "覺醒持續時間",
    ]

    percentagePlusMap = {
        "物理攻擊力": "雙攻%",
        "HP增加": "HP%",
        "攻擊體力100%以下的敵人時傷害": "100%血殺%",
        "兩極化:攻擊/被擊傷害": "兩極化%",
    }
    for pp in percentagePlusList:
        percentagePlusMap[pp] = pp + "%"

    for ablility, attribute in percentagePlusMap.items():
        searchResult = searchPercentagePlus(ablility, attribute, text)
        if searchResult:
            return searchResult

    # 雙攻+ 雙防+ 所有屬性抵抗+ -技能冷卻% 流血% -MP消耗量% 無視防禦%

    # 雙攻+
    pattern = r"物理攻擊力\+([\d.]+)"
    match = re.search(pattern, text)
    if match:
        return {"attribute": "雙攻+", "value": ast.literal_eval(match.group(1))}

    pattern = r"魔法攻擊力\+([\d.]+)"
    match = re.search(pattern, text)
    if match:
        return {}

    # 雙防+
    pattern = r"物理防禦力\+([\d.]+)"
    match = re.search(pattern, text)
    if match:
        return {"attribute": "雙防+", "value": ast.literal_eval(match.group(1))}

    pattern = r"魔法防禦力\+([\d.]+)"
    match = re.search(pattern, text)
    if match:
        return {}

    # 所有屬性抵抗+
    pattern = r"所有屬性抵抗\+([\d.]+)"
    match = re.search(pattern, text)
    if match:
        return {"attribute": "所有屬性抵抗+", "value": ast.literal_eval(match.group(1))}

    # -技能冷卻%
    pattern = r"所有技能冷卻時間\-([\d.]+)%"
    match = re.search(pattern, text)
    if match:
        return {"attribute": "-技能冷卻%", "value": ast.literal_eval(match.group(1))}

    # 流血%
    pattern = r"攻擊時所給予的傷害量([\d.]+)%左右3秒間追加持續傷害"
    match = re.search(pattern, text)
    if match:
        return {"attribute": "流血%", "value": ast.literal_eval(match.group(1))}
    pattern = r"攻攻擊時給予傷害量的([\d.]+)%程度3秒間追加持續傷害"
    match = re.search(pattern, text)
    if match:
        return {"attribute": "流血%", "value": ast.literal_eval(match.group(1))}

    # -MP消耗量%
    pattern = r"MP消耗量\-([\d.]+)%"
    match = re.search(pattern, text)
    if match:
        return {"attribute": "-MP消耗量%", "value": ast.literal_eval(match.group(1))}

    # 無視防禦%
    pattern = r"無視敵人物理防禦力([\d.]+)%"
    match = re.search(pattern, text)
    if match:
        return {"attribute": "無視防禦%", "value": ast.literal_eval(match.group(1))}
    pattern = r"無視敵人魔法防禦力([\d.]+)%"
    match = re.search(pattern, text)
    if match:
        return {}

    descriptionContent = text.strip()
    return {"description": descriptionContent} if descriptionContent != "-" else {}


def getHTML(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "TE": "Trailers",
    }

    try:
        response = requests.get(url, headers=headers)
        response.encoding = "big5"
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error during request: {e}")
        return None


def extractSuitEffect(soup, setNumber):
    set_bonus_element = soup.find("b", string=f"{setNumber}件-")
    if set_bonus_element:
        effect_elements = (
            set_bonus_element.find_parent("td")
            .find_parent("tr")
            .find_next_sibling("tr")
            .find_all("td", width="99%")
        )
        effects = [effect.text for effect in effect_elements]
        return effects
    else:
        return []


def getCellAttrList(cell):
    text = cell.text.strip().split("\n")
    return [item.strip() for item in text]


def main():
    result = []
    urlPrefix = "https://kelsword.web.fc2.com/rareavatar/ra_"

    for idx in reversed(range(1, 71)):
        url = urlPrefix + str(idx).zfill(2) + ".htm"
        soup = BeautifulSoup(getHTML(url), "html.parser")
        setName = soup.select("title")[0].text.replace(" - KelsworD", "")
        print(setName)
        partsList = []
        suitEffectsList = []
        for row in soup.select("tr"):
            columns = row.find_all("td")
            col0Title = re.sub(r"\n", "", columns[0].text).strip()
            col0Title = (
                col0Title.replace("追加", "").strip()
                if "追加" in col0Title
                else col0Title
            )

            # process suitEffects
            if col0Title == "武器":
                for idx in range(1, 10):
                    suitFXs = extractSuitEffect(columns[4], idx)
                    if suitFXs != []:
                        fxList = []
                        for suitFXIdx in range(len(suitFXs)):
                            suitFXData = parseEffect(suitFXs[suitFXIdx])
                            if suitFXData != {}:
                                fxList.append(suitFXData)
                        suitEffectsList.append({"pieces": idx, "effects": fxList})
            # process parts attributes
            if col0Title in zh2enMap:
                itemName = ""
                if col0Title == "武器":
                    itemName = setName + "武器"
                else:
                    itemName = getCellAttrList(columns[1])[0]
                    if itemName.endswith("(男)"):
                        itemName = setName + col0Title
                allAttr = getCellAttrList(columns[2]) + getCellAttrList(columns[3])
                attrList = []
                for attrIdx in range(len(allAttr)):
                    attrData = parseEffect(allAttr[attrIdx])
                    if attrData != {}:
                        attrList.append(attrData)
                partsList.append(
                    {
                        "name": itemName,
                        "part": zh2enMap[col0Title],
                        "attributes": {"attrList": attrList},
                    }
                )

        result.append(
            {
                "set": setName,
                "link": url,
                "parts": partsList,
                "suitEffects": suitEffectsList,
            }
        )
    with open("./allData.json", "w", encoding="utf-8") as f:
        f.write(json.dumps(result, ensure_ascii=False, indent=4))


main()
