(function () {
  var form = document.getElementById("form");
  var tapseInput = document.getElementById("tapse");
  var spapInput = document.getElementById("spap");
  var errorEl = document.getElementById("error");
  var resultEl = document.getElementById("result");
  var ratioEl = document.getElementById("ratio-value");
  var bandEl = document.getElementById("band");
  var markerEl = document.getElementById("marker");
  var interpretationEl = document.getElementById("interpretation");
  var explanationEl = document.getElementById("explanation");

  // Thresholds from the 2022 ESC/ERS pulmonary hypertension guidelines.
  var HIGH = 0.19;
  var LOW = 0.32;

  function classify(ratio) {
    if (ratio < HIGH) {
      return {
        cls: "high",
        band: "Severely impaired coupling – high risk",
        interpretation:
          "A TAPSE/sPAP ratio below 0.19 mm/mmHg indicates marked RV–PA uncoupling. " +
          "The right ventricle is generating little longitudinal excursion against a high afterload, " +
          "which places the patient in the high-risk stratum of the 2022 ESC/ERS guidelines.",
        explanation:
          "Longitudinal RV function is disproportionately low for the pulmonary pressure, so the ventricle " +
          "can no longer match its contractility to its load. In pulmonary hypertension this pattern is " +
          "associated with RV dilatation, reduced cardiac output and poor prognosis, and usually prompts " +
          "urgent reassessment of therapy and consideration of referral to a specialist centre."
      };
    }
    if (ratio <= LOW) {
      return {
        cls: "mid",
        band: "Reduced coupling – intermediate risk",
        interpretation:
          "A TAPSE/sPAP ratio between 0.19 and 0.32 mm/mmHg suggests RV–PA uncoupling of intermediate " +
          "severity. Ratios at or below about 0.31 mm/mmHg have been validated against invasive Ees/Ea " +
          "as a marker of uncoupling.",
        explanation:
          "The right ventricle is starting to fall behind its afterload. Contractility is no longer fully " +
          "compensating for the pulmonary pressure, so RV function should be followed closely together " +
          "with other risk markers such as NT-proBNP, functional class and right atrial size."
      };
    }
    return {
      cls: "low",
      band: "Preserved coupling – low risk",
      interpretation:
        "A TAPSE/sPAP ratio above 0.32 mm/mmHg is consistent with preserved RV–PA coupling and falls in " +
        "the low-risk stratum of the 2022 ESC/ERS guidelines.",
      explanation:
        "Longitudinal RV contraction remains adequate for the pulmonary pressure it works against, " +
        "meaning the ventricle is still adapting to its load. This is a favourable finding, although " +
        "it should be interpreted alongside the rest of the echocardiogram and the clinical picture."
    };
  }

  function markerPosition(ratio) {
    // Map the ratio onto the three-segment scale (each segment is one third wide).
    var p;
    if (ratio < HIGH) {
      p = (ratio / HIGH) / 3;
    } else if (ratio <= LOW) {
      p = 1 / 3 + ((ratio - HIGH) / (LOW - HIGH)) / 3;
    } else {
      p = 2 / 3 + Math.min((ratio - LOW) / 0.4, 1) / 3;
    }
    return Math.max(0.005, Math.min(0.995, p)) * 100;
  }

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
    resultEl.hidden = true;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var tapse = parseFloat(tapseInput.value);
    var spap = parseFloat(spapInput.value);

    if (isNaN(tapse) || isNaN(spap)) {
      showError("Please enter both TAPSE and sPAP.");
      return;
    }
    if (tapse < 1 || tapse > 50) {
      showError("TAPSE should be between 1 and 50 mm.");
      return;
    }
    if (spap < 5 || spap > 200) {
      showError("sPAP should be between 5 and 200 mmHg.");
      return;
    }

    var ratio = tapse / spap;
    var info = classify(ratio);

    errorEl.hidden = true;
    ratioEl.textContent = ratio.toFixed(2);
    bandEl.textContent = info.band;
    bandEl.className = "band " + info.cls;
    markerEl.style.left = markerPosition(ratio) + "%";
    interpretationEl.textContent = info.interpretation;
    explanationEl.textContent = info.explanation;
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
})();
