const Score = {
    Bad: 0,
    Good: 72,
    Excellent: 100,
};

const priceInput = document.querySelector("#price");

priceInput.addEventListener("input", () => {
    const price = Number(priceInput.value.replace(/[^0-9]/g, ""));

    priceInput.value = !price ? "" : price.toLocaleString("it", {
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
    });
});

priceInput.addEventListener("change", () => {
    const price = Number(priceInput.value.replace(/[^0-9]/g, ""));

    if (price > 10 && price < 1000) {
        priceInput.value = (price * 1000).toLocaleString("it", {
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
        });
    }
});

const sqmInput = document.querySelector("#sqm");

sqmInput.addEventListener("input", () => {
    const sqm = Number(sqmInput.value.replace(/[^0-9]/g, ""));

    sqmInput.value = sqm || "";
});

sqmInput.addEventListener("change", () => {
    const sqm = Number(sqmInput.value.replace(/[^0-9]/g, ""));

    if (sqm > 0 && sqm < 10) {
        sqmInput.value = sqm * 10;
    }
    if (sqm > 120) {
        sqmInput.value = 120;
    }
});

const layoutSelect = document.querySelector("#layout");
const areaSelect = document.querySelector("#area");
const viewSelect = document.querySelector("#view");
const conditionSelect = document.querySelector("#condition");
const floorSelect = document.querySelector("#floor");
const elevatorSelect = document.querySelector("#elevator");

const calcButton = document.querySelector("#calc");
const scoreElement = document.querySelector("#score");
const marketScoreElement = document.querySelector("#market-score");

calcButton.addEventListener("click", () => {
    const price = Number(priceInput.value.replace(/[^0-9]/g, ""));
    const sqm = Number(sqmInput.value.replace(/[^0-9]/g, ""));
    const layout = Score[layoutSelect.value];
    const area = Score[areaSelect.value];
    const view = Score[viewSelect.value];
    const condition = Score[conditionSelect.value];
    const floor = Number(floorSelect.value);
    const elevator = elevatorSelect.value === "true";

    if (
        price === 0 ||
        isNaN(price) ||
        sqm === 0 ||
        isNaN(sqm) ||
        layout === undefined ||
        area === undefined ||
        view === undefined ||
        condition === undefined ||
        isNaN(floor)
    ) {
        return;
    }

    const result = calcScore({ price, sqm, layout, area, view, condition, floor, elevator });

    scoreElement.innerHTML = result.score;
    marketScoreElement.innerHTML = result.marketScore;
});

function calcScore({
    price,
    sqm,
    layout,
    area,
    view,
    condition,
    floor,
    elevator,
}) {
    const priceSqm = price / sqm;

    const access = elevator || floor < 2 ? Score.Excellent :
        floor < 3 ? Score.Good :
            Score.Bad;

    const extraExpenseSqm = condition === Score.Bad ? 900 :
        condition === Score.Good ? 250 :
            50;

    const priceSqmRelative = priceSqm + extraExpenseSqm;

    const totalPrice = priceSqmRelative * sqm;

    const budget = 190_000;
    const targetSqm = 2700;

    const priceScore = Math.max(0,
        100 - Math.max(0, Math.min(100,
            // sqm score
            (priceSqmRelative - targetSqm) / 6)
        )
        // over budget penalty
        + Math.max(-100, Math.min(0,
            (budget - totalPrice) / 230
        ))
    );

    const size = Math.min(Math.max((sqm - 50) * 5, 0), 100);

    const score = (
        area * 0.5 +
        access * 0.25 +
        layout * 0.75 +
        view * 0.75 +
        size * 1 +
        priceScore * 1
    ) / 4.25;

    const marketScore = (
        area * 1 +
        view * 0.5 +
        layout * 0.5 +
        access * 0.5
    ) / 2.5;

    return {
        score: Math.floor(score),
        marketScore: Math.floor(marketScore),
    };
}
