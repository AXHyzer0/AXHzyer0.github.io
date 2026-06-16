// --- Initialize Lucide Icons & Global Math Rendering ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Render all static math on the page immediately
    renderAllPageMath();
    
    // 2. Initialize modules
    lucide.createIcons();
    initializeTabs();
    initializeTheme();
    initializeCalculators();
    initializeAnalyzer();
    initializeQuiz();
    initializeGlossary();
});

// --- Global Math Rendering ---
function renderAllPageMath() {
    // Render elements with explicit math-expr class
    document.querySelectorAll('.math-expr').forEach(el => {
        const expr = el.getAttribute('data-expr');
        if (expr) {
            try {
                katex.render(expr, el, {
                    throwOnError: false,
                    displayMode: false
                });
            } catch (e) {
                console.error("Error rendering static math-expr:", e);
            }
        }
    });

    // Run auto-render for inline $...$ and block $$...$$ across the entire document body
    if (typeof renderMathInElement === "function") {
        renderMathInElement(document.body, {
            delimiters: [
                {left: "$$", right: "$$", display: true},
                {left: "$", right: "$", display: false},
                {left: "\\(", right: "\\)", display: false},
                {left: "\\[", right: "\\]", display: true}
            ],
            throwOnError: false
        });
    }
}

// --- Theme Management ---
function initializeTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    
    // Check local storage or default to dark
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", savedTheme);
    
    themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.getAttribute("data-theme");
        const newTheme = currentTheme === "light" ? "dark" : "light";
        document.body.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);
    });
}

// --- Tab Navigation ---
const tabData = {
    rules: { title: "Reglas de Derivación: El Acordeón", subtitle: "Domina las fórmulas fundamentales e interactúa con sus ejemplos." },
    steps: { title: "Guía Paso a Paso para Derivar", subtitle: "Aprende el algoritmo exacto y los trucos prácticos para resolver tu examen." },
    analyzer: { title: "Simulador de Análisis de Funciones", subtitle: "Selecciona un caso de estudio o personaliza coeficientes para ver el análisis completo." },
    quiz: { title: "Entrenador para el Examen", subtitle: "Ponte a prueba con cuestionarios dinámicos y domina los trucos matemáticos." },
    tips: { title: "Tips Rápidos para el Examen", subtitle: "Consejos prácticos para evitar los errores más comunes de álgebra y derivadas." }
};

function initializeTabs() {
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");
    const pageTitle = document.getElementById("page-title");
    const pageSubtitle = document.getElementById("page-subtitle");
    
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            const targetTab = item.getAttribute("data-tab");
            
            // Update nav buttons
            navItems.forEach(nav => nav.classList.remove("active"));
            item.classList.add("active");
            
            // Update tab panels
            tabPanels.forEach(panel => panel.classList.remove("active"));
            document.getElementById(`tab-${targetTab}`).classList.add("active");
            
            // Update headers
            if (tabData[targetTab]) {
                pageTitle.textContent = tabData[targetTab].title;
                pageSubtitle.textContent = tabData[targetTab].subtitle;
            }
            
            // Trigger graph resize if entering analyzer tab
            if (targetTab === 'analyzer') {
                setTimeout(() => {
                    if (chartInstance) {
                        chartInstance.resize();
                    }
                }, 100);
            }
        });
    });
}

// --- Render Math Helper ---
function renderLaTeX(containerId, latexStr, displayMode = false) {
    const el = document.getElementById(containerId);
    if (el) {
        try {
            katex.render(latexStr, el, {
                throwOnError: false,
                displayMode: displayMode
            });
        } catch (e) {
            el.innerHTML = latexStr;
        }
    }
}

// --- Math display placeholders handled globally on load ---

// --- Acordeón Interactive Calculators ---
function initializeCalculators() {
    // Calc tabs
    const calcTabs = document.querySelectorAll(".calc-tab");
    const calcViews = document.querySelectorAll(".calc-view");
    
    calcTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const targetView = tab.getAttribute("data-calc");
            
            calcTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            calcViews.forEach(v => v.classList.remove("active"));
            document.getElementById(`calc-${targetView}`).classList.add("active");
        });
    });
    
    // Inputs Product & Quotient
    const uInput = document.getElementById("calc-u");
    const uPrimeInput = document.getElementById("calc-u-prime");
    const vInput = document.getElementById("calc-v");
    const vPrimeInput = document.getElementById("calc-v-prime");
    
    const updateProductQuotientCalc = () => {
        let uVal = uInput.value || "u";
        let upVal = uPrimeInput.value || "u'";
        let vVal = vInput.value || "v";
        let vpVal = vPrimeInput.value || "v'";
        
        // Render real-time math previews below input boxes
        renderLaTeX("calc-u-preview", uVal);
        renderLaTeX("calc-u-prime-preview", upVal);
        renderLaTeX("calc-v-preview", vVal);
        renderLaTeX("calc-v-prime-preview", vpVal);
        
        // Assemble product
        // Formula: (u' * v) + (u * v')
        let productLaTeX = `\\left(${upVal}\\right)\\left(${vVal}\\right) + \\left(${uVal}\\right)\\left(${vpVal}\\right)`;
        renderLaTeX("product-result-math", productLaTeX, true);
        
        // Assemble quotient
        // Formula: ((u' * v) - (u * v')) / v^2
        let quotientLaTeX = `\\frac{\\left(${upVal}\\right)\\left(${vVal}\\right) - \\left(${uVal}\\right)\\left(${vpVal}\\right)}{\\left(${vVal}\\right)^2}`;
        renderLaTeX("quotient-result-math", quotientLaTeX, true);
    };
    
    [uInput, uPrimeInput, vInput, vPrimeInput].forEach(inp => {
        inp.addEventListener("input", updateProductQuotientCalc);
    });
    updateProductQuotientCalc();
    
    // Root Converter & Chain Rule Calculator
    const indexInput = document.getElementById("root-index");
    const baseInput = document.getElementById("root-base");
    const powerInput = document.getElementById("root-power");
    
    const updateRootCalc = () => {
        let n = parseInt(indexInput.value) || 2;
        let base = baseInput.value || "x";
        let m = parseInt(powerInput.value) || 1;
        
        // Step 1: exponent representation (simplified)
        let basePowerLaTeX = simplifyFraction(m, n);
        let fracExpLaTeX = `\\sqrt[${n}]{(${base})^${m}} = (${base})^{${basePowerLaTeX}}`;
        renderLaTeX("root-frac-math", fracExpLaTeX, true);
        
        // Step 2: Derivative by chain rule (simplified exponent)
        let derivPowerLaTeX = simplifyFraction(m - n, n);
        
        let baseDeriv = "1";
        if (base.includes("x")) {
            let clean = base.replace(/\s+/g, "");
            let match = clean.match(/(-?\d*)x/);
            if (match) {
                baseDeriv = match[1] === "" ? "1" : (match[1] === "-" ? "-1" : match[1]);
            }
        }
        
        let chainLaTeX = `\\frac{d}{dx}\\left[(${base})^{${basePowerLaTeX}}\\right] = \\frac{${m}}{${n}} (${base})^{${derivPowerLaTeX}} \\cdot \\left(${baseDeriv}\\right)`;
        renderLaTeX("root-chain-math", chainLaTeX, true);
        
        let explanationText = `Derivamos de afuera hacia adentro: <br>
        1. <strong>Afuera:</strong> Bajamos el exponente fraccionario <strong>$${simplifyFraction(m, n)}$</strong> al frente.<br>
        2. <strong>En el medio:</strong> Restamos 1 al exponente principal: <strong>$${simplifyFraction(m, n)} - 1 = ${simplifyFraction(m - n, n)}$</strong>.<br>
        3. <strong>Adentro (Derivada Interna):</strong> Multiplicamos todo por la derivada interna de <em>(${base})</em> que es <strong>${baseDeriv}</strong>.`;
        document.getElementById("root-explanation-text").innerHTML = explanationText;
        
        // Render any LaTeX embedded in the explanation
        renderMathInElement(document.getElementById("root-explanation-text"), {
            delimiters: [{left: "$", right: "$", display: false}]
        });
    };
    
    [indexInput, baseInput, powerInput].forEach(inp => {
        inp.addEventListener("input", updateRootCalc);
    });
    updateRootCalc();
    
    // Transcendental Calculator
    const trigUInput = document.getElementById("trig-u");
    const trigUPrimeInput = document.getElementById("trig-u-prime");
    const trigCoefInput = document.getElementById("trig-coef");
    
    const updateTrigExpCalc = () => {
        let u = trigUInput.value || "u";
        let up = trigUPrimeInput.value || "u'";
        let a = parseFloat(trigCoefInput.value) || 1;
        
        // Render real-time math previews below input boxes
        renderLaTeX("trig-u-preview", u);
        renderLaTeX("trig-u-prime-preview", up);
        
        // Trig Derivative: d/dx [ a sen(u) ] = a cos(u) * u' -> (a * u') cos(u)
        let senDeriv = `${a} \\cos(${u}) \\cdot \\left(${up}\\right)`;
        renderLaTeX("trig-sen-math", senDeriv, true);
        
        // Exp Derivative: d/dx [ e^u ] = e^u * u'
        let expDeriv = `e^{${u}} \\cdot \\left(${up}\\right)`;
        renderLaTeX("trig-exp-math", expDeriv, true);
    };
    
    [trigUInput, trigUPrimeInput, trigCoefInput].forEach(inp => {
        inp.addEventListener("input", updateTrigExpCalc);
    });
    updateTrigExpCalc();
}

// --- Calculus Math Engine & Solvers ---

// Helper: Evaluate polynomial
function evalPoly(coefs, x) {
    let sum = 0;
    let len = coefs.length;
    for (let i = 0; i < len; i++) {
        let coef = coefs[i];
        let power = len - 1 - i;
        sum += coef * Math.pow(x, power);
    }
    return sum;
}

// Helper: Derive polynomial
function derivePoly(coefs) {
    let len = coefs.length;
    if (len <= 1) return [0];
    let derived = [];
    for (let i = 0; i < len - 1; i++) {
        let coef = coefs[i];
        let power = len - 1 - i;
        derived.push(coef * power);
    }
    return derived;
}

// Helper: Simplify and format fraction for LaTeX
function simplifyFraction(num, den) {
    if (num === 0) return "0";
    const gcd = (x, y) => y === 0 ? x : gcd(y, x % y);
    let common = Math.abs(gcd(num, den));
    num = num / common;
    den = den / common;
    
    let sign = (num < 0 && den > 0) || (num > 0 && den < 0) ? "-" : "";
    num = Math.abs(num);
    den = Math.abs(den);
    
    if (den === 1) return sign + num;
    return `${sign}\\frac{${num}}{${den}}`;
}

// Depressed cubic solver for real roots (Cardano)
function solveCubic(a, b, c, d) {
    if (Math.abs(a) < 1e-9) return [];
    
    let b_ = b / a;
    let c_ = c / a;
    let d_ = d / a;
    
    let p = c_ - (b_ * b_) / 3.0;
    let q = (2.0 * b_ * b_ * b_) / 27.0 - (b_ * c_) / 3.0 + d_;
    
    let roots = [];
    let shift = -b_ / 3.0;
    
    let disc = q*q/4.0 + p*p*p/27.0;
    
    if (disc > 1e-9) {
        let u = Math.cbrt(-q/2.0 + Math.sqrt(disc));
        let v = Math.cbrt(-q/2.0 - Math.sqrt(disc));
        roots.push(u + v + shift);
    } else if (Math.abs(disc) < 1e-9) {
        if (Math.abs(q) < 1e-9) {
            roots.push(shift);
        } else {
            let u = Math.cbrt(-q/2.0);
            roots.push(2*u + shift);
            roots.push(-u + shift);
        }
    } else {
        let r = Math.sqrt(-p*p*p/27.0);
        // Clamp input to Math.acos to prevent NaN from floating point errors
        let val = -q / (2.0 * r);
        val = Math.max(-1.0, Math.min(1.0, val));
        let phi = Math.acos(val);
        let t1 = 2.0 * Math.cbrt(r) * Math.cos(phi / 3.0);
        let t2 = 2.0 * Math.cbrt(r) * Math.cos((phi + 2.0 * Math.PI) / 3.0);
        let t3 = 2.0 * Math.cbrt(r) * Math.cos((phi + 4.0 * Math.PI) / 3.0);
        roots.push(t1 + shift);
        roots.push(t2 + shift);
        roots.push(t3 + shift);
    }
    return roots;
}

// Master polynomial roots solver (quadratic and cubic only)
function solvePolynomialRoots(coefs) {
    // Filter leading zeros
    let filtered = [...coefs];
    while(filtered.length > 0 && Math.abs(filtered[0]) < 1e-9) {
        filtered.shift();
    }
    
    let deg = filtered.length - 1;
    if (deg === 1) {
        let a = filtered[0];
        let b = filtered[1];
        return [-b / a];
    } else if (deg === 2) {
        let a = filtered[0];
        let b = filtered[1];
        let c = filtered[2];
        let disc = b*b - 4*a*c;
        if (disc < -1e-9) {
            return [];
        } else if (Math.abs(disc) < 1e-9) {
            return [-b / (2*a)];
        } else {
            let r1 = (-b + Math.sqrt(disc)) / (2*a);
            let r2 = (-b - Math.sqrt(disc)) / (2*a);
            return [r1, r2];
        }
    } else if (deg === 3) {
        let a = filtered[0];
        let b = filtered[1];
        let c = filtered[2];
        let d = filtered[3];
        return solveCubic(a, b, c, d);
    }
    return [];
}

// Formatter: Polynomial into LaTeX
function formatPolyLaTeX(coefs) {
    let terms = [];
    let degrees = [4, 3, 2, 1, 0];
    
    for (let i = 0; i < coefs.length; i++) {
        let coef = coefs[i];
        let deg = degrees[degrees.length - coefs.length + i];
        
        if (Math.abs(coef) < 1e-9) continue;
        
        let termStr = "";
        
        let sign = "";
        if (coef < 0) {
            sign = " - ";
            coef = -coef;
        } else if (terms.length > 0) {
            sign = " + ";
        }
        
        let coefStr = "";
        if (coef !== 1 || deg === 0) {
            coefStr = Number(coef.toFixed(2)).toString();
        }
        
        let varStr = "";
        if (deg > 1) {
            varStr = `x^${deg}`;
        } else if (deg === 1) {
            varStr = "x";
        }
        
        terms.push(sign + coefStr + varStr);
    }
    
    if (terms.length === 0) return "0";
    
    let result = terms.join("");
    if (result.startsWith(" + ")) {
        result = result.substring(3);
    } else if (result.startsWith(" - ")) {
        result = "-" + result.substring(3);
    }
    return result;
}

// Formatter: Single term for breakdown (Step 0)
function formatTermLaTeX(coef, deg) {
    let sign = coef < 0 ? "-" : "";
    let absCoef = Math.abs(coef);
    let coefStr = absCoef === 1 && deg > 0 ? "" : absCoef.toString();
    let varStr = deg > 1 ? `x^${deg}` : (deg === 1 ? "x" : "");
    return sign + coefStr + varStr;
}

function formatTermDerivLaTeX(coef, deg) {
    if (deg === 0) return "0";
    let newCoef = coef * deg;
    let newDeg = deg - 1;
    
    let sign = newCoef < 0 ? "-" : "";
    let absNewCoef = Math.abs(newCoef);
    let coefStr = absNewCoef === 1 && newDeg > 0 ? "" : absNewCoef.toString();
    let varStr = newDeg > 1 ? `x^${newDeg}` : (newDeg === 1 ? "x" : "");
    return sign + coefStr + varStr;
}

function getTermDerivExplanation(coef, deg) {
    if (deg === 0) {
        return `El término es una constante <strong>${coef}</strong>. Su derivada es siempre <strong>0</strong>.`;
    } else if (deg === 1) {
        return `El término es lineal <strong>${coef}x</strong>. Al derivar, la variable $x$ desaparece y queda únicamente el coeficiente <strong>${coef}</strong>.`;
    } else {
        let newCoefStr = `${coef} \\cdot ${deg} = ${coef * deg}`;
        return `Bajas el exponente <strong>${deg}</strong> a multiplicar por el coeficiente <strong>${coef}</strong> (${newCoefStr}) y le restas 1 al exponente, quedando <strong>x^{${deg-1}}</strong>.`;
    }
}

// --- Function Analyzer Tab ---
let currentPreset = 'quadratic';
let currentCoefs = [0, 0, 1, 6, 8]; // x^2 + 6x + 8
let currentDfCoefs = [0, 0, 0, 2, 6];
let currentDdfCoefs = [0, 0, 0, 0, 2];
let chartInstance = null;

const presets = {
    quadratic: [0, 0, 1, 6, 8],     // x^2 + 6x + 8
    cubic: [0, 1, 0, -3, 0],         // x^3 - 3x
    quartic: [1, 0, -6, 0, 8]        // x^4 - 6x^2 + 8
};

function initializeAnalyzer() {
    // Presets listeners
    const presetBtns = document.querySelectorAll(".btn-preset");
    const customCoefsContainer = document.getElementById("custom-coefs");
    
    presetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            presetBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            const preset = btn.getAttribute("data-preset");
            currentPreset = preset;
            
            if (preset === "custom") {
                customCoefsContainer.style.display = "block";
            } else {
                customCoefsContainer.style.display = "none";
                currentCoefs = [...presets[preset]];
                runFullAnalysis();
            }
        });
    });
    
    // Apply custom btn
    const applyCustomBtn = document.getElementById("apply-custom-btn");
    applyCustomBtn.addEventListener("click", () => {
        const A = parseFloat(document.getElementById("coef-A").value) || 0;
        const B = parseFloat(document.getElementById("coef-B").value) || 0;
        const C = parseFloat(document.getElementById("coef-C").value) || 0;
        const D = parseFloat(document.getElementById("coef-D").value) || 0;
        const E = parseFloat(document.getElementById("coef-E").value) || 0;
        
        currentCoefs = [A, B, C, D, E];
        runFullAnalysis();
    });
    
    // Stepper Navigation
    const stepTabs = document.querySelectorAll(".step-nav-tab");
    const stepContents = document.querySelectorAll(".step-content");
    
    stepTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const stepIndex = tab.getAttribute("data-step");
            
            stepTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            stepContents.forEach(c => c.classList.remove("active"));
            document.getElementById(`analyzer-step-${stepIndex}`).classList.add("active");
            
            // Resize canvas if graph panel opened
            if (stepIndex === "6" && chartInstance) {
                setTimeout(() => {
                    chartInstance.resize();
                }, 50);
            }
        });
    });
    
    // Table Range listeners
    const tableBtn = document.getElementById("generate-table-btn");
    tableBtn.addEventListener("click", () => {
        const critPoints = solvePolynomialRoots(currentDfCoefs);
        const uniqueCrit = critPoints.map(r => Number(r.toFixed(3))).filter((v, i, self) => self.indexOf(v) === i);
        const inflPoints = solvePolynomialRoots(currentDdfCoefs);
        const uniqueInfl = inflPoints.map(r => Number(r.toFixed(3))).filter((v, i, self) => self.indexOf(v) === i);
        
        updateStep5(uniqueCrit, uniqueInfl, currentCoefs, currentDfCoefs);
    });
    
    // Run initial analysis
    runFullAnalysis();
    
    // Inspector & Tangent interaction - attached only once to canvas to avoid multiple listener conflicts
    const canvas = document.getElementById('function-canvas');
    if (canvas) {
        canvas.addEventListener('mousemove', (e) => {
            if (!chartInstance) return;
            
            const rect = canvas.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            
            const xArea = chartInstance.scales.x;
            const xVal = xArea.getValueForPixel(offsetX);
            
            if (xVal >= -12 && xVal <= 12) {
                updateInspectorValues(xVal, currentCoefs, currentDfCoefs);
                drawTangentLine(xVal, currentCoefs, currentDfCoefs);
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            if (chartInstance && chartInstance.data.datasets[1]) {
                chartInstance.data.datasets[1].data = [];
                chartInstance.update('none');
            }
        });
    }
}

function runFullAnalysis() {
    // Derive
    currentDfCoefs = derivePoly(currentCoefs);
    currentDdfCoefs = derivePoly(currentDfCoefs);
    
    // Display current function
    renderLaTeX("analyzer-curr-func", `f(x) = ${formatPolyLaTeX(currentCoefs)}`, true);
    
    // Find Roots
    const critPoints = solvePolynomialRoots(currentDfCoefs);
    // Unique and sorted roots
    const uniqueCrit = critPoints
        .map(r => Number(r.toFixed(3)))
        .filter((v, i, self) => self.indexOf(v) === i)
        .sort((m, n) => m - n);
        
    const inflPoints = solvePolynomialRoots(currentDdfCoefs);
    const uniqueInfl = inflPoints
        .map(r => Number(r.toFixed(3)))
        .filter((v, i, self) => self.indexOf(v) === i)
        .sort((m, n) => m - n);
    
    // Update Step panels
    updateStep0(currentCoefs);
    updateStep1(currentCoefs, currentDfCoefs, currentDdfCoefs);
    updateStep2(currentDfCoefs, uniqueCrit);
    updateStep3(uniqueCrit, currentCoefs, currentDdfCoefs);
    updateStep4(uniqueInfl, uniqueCrit, currentCoefs, currentDfCoefs, currentDdfCoefs);
    updateStep5(uniqueCrit, uniqueInfl, currentCoefs, currentDfCoefs);
    drawChart(currentCoefs, uniqueCrit, uniqueInfl);
}

// --- Dynamic Step Panel Updates ---
function updateStep0(coefs) {
    const container = document.getElementById('power-rule-breakdown-container');
    container.innerHTML = '';
    
    let degrees = [4, 3, 2, 1, 0];
    let termsWritten = 0;
    
    for (let i = 0; i < coefs.length; i++) {
        let coef = coefs[i];
        let deg = degrees[degrees.length - coefs.length + i];
        
        if (Math.abs(coef) < 1e-9) continue;
        
        termsWritten++;
        const row = document.createElement('div');
        row.className = 'breakdown-row';
        
        let termLaTeX = formatTermLaTeX(coef, deg);
        let derivLaTeX = formatTermDerivLaTeX(coef, deg);
        let desc = getTermDerivExplanation(coef, deg);
        
        row.innerHTML = `
            <div class="breakdown-row-header">
                <h5>Término de Grado ${deg}</h5>
            </div>
            <div class="breakdown-row-math">
                <span id="term-math-${i}"></span>
                <span class="breakdown-arrow">\\rightarrow</span>
                <span id="deriv-math-${i}"></span>
            </div>
            <div class="breakdown-row-desc">${desc}</div>
        `;
        container.appendChild(row);
        
        renderLaTeX(`term-math-${i}`, termLaTeX);
        renderLaTeX(`deriv-math-${i}`, derivLaTeX);
    }
    
    // Draw arrows
    container.querySelectorAll('.breakdown-arrow').forEach(el => {
        katex.render('\\rightarrow', el);
    });
}

function updateStep1(coefs, dfCoefs, ddfCoefs) {
    renderLaTeX('step1-f', `f(x) = ${formatPolyLaTeX(coefs)}`, true);
    renderLaTeX('step1-df', `f'(x) = ${formatPolyLaTeX(dfCoefs)}`, true);
    renderLaTeX('step1-ddf', `f''(x) = ${formatPolyLaTeX(ddfCoefs)}`, true);
}

function updateStep2(dfCoefs, uniqueCrit) {
    // Equation
    renderLaTeX('step2-equation', `${formatPolyLaTeX(dfCoefs)} = 0`, true);
    
    // Algebra steps
    const stepsDiv = document.getElementById('step2-algebra-steps');
    stepsDiv.innerHTML = '';
    
    const steps = getAlgebraicStepsForDF(dfCoefs);
    steps.forEach(st => {
        const div = document.createElement('div');
        div.className = 'solver-step';
        div.innerHTML = `
            <strong>${st.title}:</strong>
            <div>${st.desc}</div>
            <div class="solver-step-math">$$${st.math}$$</div>
        `;
        stepsDiv.appendChild(div);
    });
    
    // Badges
    const badgeRow = document.getElementById('step2-critical-badges');
    badgeRow.innerHTML = '';
    
    if (uniqueCrit.length === 0) {
        badgeRow.innerHTML = `<span class="point-badge" style="color: var(--text-muted);">No existen puntos críticos reales</span>`;
    } else {
        uniqueCrit.forEach((xc, idx) => {
            const span = document.createElement('span');
            span.className = 'point-badge';
            span.innerHTML = `<i data-lucide="crosshair"></i> P. Crítico ${idx+1}: <strong>x = ${xc.toFixed(3)}</strong>`;
            badgeRow.appendChild(span);
        });
    }
    
    lucide.createIcons();
    renderMathInElement(stepsDiv, {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
        ]
    });
}

function getAlgebraicStepsForDF(dfCoefs) {
    let filtered = [...dfCoefs];
    while(filtered.length > 0 && Math.abs(filtered[0]) < 1e-9) {
        filtered.shift();
    }
    
    let deg = filtered.length - 1;
    let steps = [];
    
    if (deg === 1) {
        let a = filtered[0];
        let b = filtered[1];
        steps.push({
            title: "Despeje Lineal",
            desc: `Pasamos la constante al otro lado y dividimos por el coeficiente de $x$.`,
            math: `${a}x + ${b > 0 ? '+' : ''}${b} = 0 \\implies x = \\frac{-(${b})}{${a}} = ${(-b/a).toFixed(3)}`
        });
    } else if (deg === 2) {
        let a = filtered[0];
        let b = filtered[1];
        let c = filtered[2];
        let disc = b*b - 4*a*c;
        steps.push({
            title: "Fórmula General Cuadrática",
            desc: `Aplicamos la fórmula cuadrática: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ con $a = ${a}$, $b = ${b}$, $c = ${c}$.`,
            math: `x = \\frac{-(${b}) \\pm \\sqrt{(${b})^2 - 4(${a})(${c})}}{2(${a})}`
        });
        steps.push({
            title: "Cálculo del Discriminante",
            desc: `Evaluamos la expresión bajo la raíz (discriminante): $\\Delta = b^2 - 4ac$.`,
            math: `\\Delta = (${b})^2 - 4(${a})(${c}) = ${disc.toFixed(3)}`
        });
        if (disc > 1e-9) {
            let r1 = (-b + Math.sqrt(disc)) / (2*a);
            let r2 = (-b - Math.sqrt(disc)) / (2*a);
            steps.push({
                title: "Dos Raíces Reales",
                desc: `Como el discriminante $\\Delta > 0$, obtenemos dos soluciones reales distintas.`,
                math: `x_1 = ${r2.toFixed(3)}, \\quad x_2 = ${r1.toFixed(3)}`
            });
        } else if (Math.abs(disc) < 1e-9) {
            let r = -b / (2*a);
            steps.push({
                title: "Una Raíz Real Única",
                desc: `Como $\\Delta = 0$, obtenemos una única solución repetida (punto de retorno único).`,
                math: `x = ${r.toFixed(3)}`
            });
        } else {
            steps.push({
                title: "Sin Soluciones Reales",
                desc: `Como $\\Delta < 0$, la ecuación no tiene raíces reales. La función no cambia de dirección.`,
                math: `x \\notin \\mathbb{R}`
            });
        }
    } else if (deg === 3) {
        let a = filtered[0];
        let b = filtered[1];
        let c = filtered[2];
        let d = filtered[3];
        
        if (Math.abs(b) < 1e-9 && Math.abs(d) < 1e-9) {
            steps.push({
                title: "Factorización por Término Común",
                desc: `Extraemos $x$ como factor común de la ecuación cúbica: $x(${a}x^2 + ${c > 0 ? '+' : ''}${c}) = 0$.`,
                math: `x = 0 \\quad \\text{o} \\quad ${a}x^2 + ${c} = 0`
            });
            let quadraticRootsVal = -c / a;
            if (quadraticRootsVal > 0) {
                let r1 = Math.sqrt(quadraticRootsVal);
                let r2 = -r1;
                steps.push({
                    title: "Solución de la Parte Cuadrática",
                    desc: `Resolvemos $x^2 = -c/a = -(${c})/(${a}) = ${quadraticRootsVal.toFixed(3)}$.`,
                    math: `x = \\pm\\sqrt{${quadraticRootsVal.toFixed(3)}} = \\pm ${r1.toFixed(3)}`
                });
                steps.push({
                    title: "Tres Soluciones Encontradas",
                    desc: `Uniendo las soluciones obtenemos tres puntos críticos.`,
                    math: `x_1 = ${r2.toFixed(3)}, \\quad x_2 = 0, \\quad x_3 = ${r1.toFixed(3)}`
                });
            } else {
                steps.push({
                    title: "Solución de la Parte Cuadrática",
                    desc: `Resolvemos $x^2 = -c/a = ${quadraticRootsVal.toFixed(3)}$, lo cual no tiene raíces reales por ser negativo.`,
                    math: `x \\notin \\mathbb{R}`
                });
                steps.push({
                    title: "Una Única Solución Real",
                    desc: `El único punto crítico real es $x = 0$.`,
                    math: `x = 0`
                });
            }
        } else {
            steps.push({
                title: "Resolución de Ecuación Cúbica General",
                desc: `Resolvemos la ecuación cúbica $ax^3 + bx^2 + cx + d = 0$ usando Cardano.`,
                math: `${formatPolyLaTeX(dfCoefs)} = 0`
            });
            let roots = solveCubic(a, b, c, d);
            roots = roots.map(r => Number(r.toFixed(3))).filter((v, i, self) => self.indexOf(v) === i).sort((m, n) => m - n);
            steps.push({
                title: "Raíces Cúbicas Obtenidas",
                desc: `Las soluciones representan los puntos críticos:`,
                math: roots.map((r, idx) => `x_${idx+1} = ${r.toFixed(3)}`).join(',\\quad ')
            });
        }
    }
    return steps;
}

function updateStep3(criticalPoints, coefs, ddfCoefs) {
    const tbody = document.getElementById('step3-evaluation-tbody');
    tbody.innerHTML = '';
    
    if (criticalPoints.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No se encontraron puntos críticos reales. La función no tiene máximos ni mínimos locales.</td></tr>`;
        return;
    }
    
    criticalPoints.forEach((xc) => {
        let y = evalPoly(coefs, xc);
        let ddfVal = evalPoly(ddfCoefs, xc);
        
        let classification = "";
        let classBadge = "";
        
        if (ddfVal > 1e-5) {
            classification = "MÍNIMO LOCAL (Cóncava)";
            classBadge = `<span class="class-badge min">Mínimo</span>`;
        } else if (ddfVal < -1e-5) {
            classification = "MÁXIMO LOCAL (Convexa)";
            classBadge = `<span class="class-badge max">Máximo</span>`;
        } else {
            classification = "INDEFINIDO / INFLEXIÓN";
            classBadge = `<span class="class-badge" style="background-color: var(--bg-input); color: var(--text-muted);">Silladura</span>`;
        }
        
        let row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>x = ${xc.toFixed(3)}</strong></td>
            <td>$f''(${xc.toFixed(2)}) = ${ddfVal.toFixed(3)}$</td>
            <td>${classBadge} <br><small style="color: var(--text-muted);">${classification}</small></td>
            <td>$y = ${y.toFixed(3)}$</td>
            <td><strong>(${xc.toFixed(2)}, ${y.toFixed(2)})</strong></td>
        `;
        tbody.appendChild(row);
    });
    
    renderMathInElement(tbody, {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
        ]
    });
}

function updateStep4(inflectionPoints, criticalPoints, coefs, dfCoefs, ddfCoefs) {
    renderLaTeX('step4-equation', `${formatPolyLaTeX(ddfCoefs)} = 0`, true);
    
    const stepsDiv = document.getElementById('step4-algebra-steps');
    stepsDiv.innerHTML = '';
    
    let filtered = [...ddfCoefs];
    while(filtered.length > 0 && Math.abs(filtered[0]) < 1e-9) {
        filtered.shift();
    }
    
    let deg = filtered.length - 1;
    
    if (deg === 1) {
        let a = filtered[0];
        let b = filtered[1];
        let xi = -b / a;
        stepsDiv.innerHTML = `
            <div class="solver-step">
                <strong>Despeje Lineal:</strong>
                <div>Resolvemos para encontrar el punto de inflexión:</div>
                <div class="solver-step-math">$${a}x + ${b > 0 ? '+' : ''}${b} = 0 \\implies x = \\frac{-(${b})}{${a}} = ${xi.toFixed(3)}$</div>
            </div>
        `;
    } else if (deg === 2) {
        let a = filtered[0];
        let b = filtered[1];
        let c = filtered[2];
        let disc = b*b - 4*a*c;
        let mathStr = `x = \\frac{-(${b}) \\pm \\sqrt{(${b})^2 - 4(${a})(${c})}}{2(${a})} = \\frac{-(${b}) \\pm \\sqrt{${disc.toFixed(2)}}}{${(2*a).toFixed(2)}}`;
        stepsDiv.innerHTML = `
            <div class="solver-step">
                <strong>Fórmula General Cuadrática:</strong>
                <div>Buscamos dónde la aceleración se anula ($f''(x) = 0$):</div>
                <div class="solver-step-math">$$${mathStr}$$</div>
            </div>
        `;
        if (disc > 1e-9) {
            let r1 = (-b + Math.sqrt(disc)) / (2*a);
            let r2 = (-b - Math.sqrt(disc)) / (2*a);
            stepsDiv.innerHTML += `
                <div class="solver-step">
                    <strong>Puntos de Inflexión:</strong>
                    <div>Dos raíces reales para $f''(x) = 0$:</div>
                    <div class="solver-step-math">$$x_1 = ${r2.toFixed(3)}, \\quad x_2 = ${r1.toFixed(3)}$$</div>
                </div>
            `;
        } else if (Math.abs(disc) < 1e-9) {
            let r = -b / (2*a);
            stepsDiv.innerHTML += `
                <div class="solver-step">
                    <strong>Punto de Inflexión:</strong>
                    <div>Una sola raíz real duplicada:</div>
                    <div class="solver-step-math">$$x = ${r.toFixed(3)}$$</div>
                </div>
            `;
        } else {
            stepsDiv.innerHTML += `
                <div class="solver-step">
                    <strong>Sin Soluciones Reales:</strong>
                    <div>No hay soluciones reales para la concavidad. La gráfica mantiene su concavidad constante.</div>
                </div>
            `;
        }
    } else {
        stepsDiv.innerHTML = `
            <div class="solver-step">
                <strong>Segunda Derivada Constante:</strong>
                <div>La concavidad no cambia porque $f''(x)$ es un valor constante.</div>
                <div class="solver-step-math">$$f''(x) = ${ddfCoefs[ddfCoefs.length - 1].toFixed(2)}$$</div>
            </div>
        `;
    }
    
    // Badges
    const badgeRow = document.getElementById('step4-inflection-badges');
    badgeRow.innerHTML = '';
    if (inflectionPoints.length === 0) {
        badgeRow.innerHTML = `<span class="point-badge" style="color: var(--text-muted);"><i data-lucide="slash"></i> No hay puntos de inflexión</span>`;
    } else {
        inflectionPoints.forEach((xi, idx) => {
            let y = evalPoly(coefs, xi);
            let span = document.createElement('span');
            span.className = 'point-badge';
            span.innerHTML = `<i data-lucide="split"></i> Inflexión ${idx+1}: <strong>(${xi.toFixed(2)}, ${y.toFixed(2)})</strong>`;
            badgeRow.appendChild(span);
        });
    }
    
    // Intervals
    const intervalGrid = document.getElementById('step4-intervals-grid');
    intervalGrid.innerHTML = '';
    
    // Crecimiento
    let sortedCrit = [...criticalPoints].sort((m, n) => m - n);
    let monoIntervals = [];
    if (sortedCrit.length === 0) {
        monoIntervals.push({ min: -Infinity, max: Infinity });
    } else {
        monoIntervals.push({ min: -Infinity, max: sortedCrit[0] });
        for (let i = 0; i < sortedCrit.length - 1; i++) {
            monoIntervals.push({ min: sortedCrit[i], max: sortedCrit[i+1] });
        }
        monoIntervals.push({ min: sortedCrit[sortedCrit.length - 1], max: Infinity });
    }
    
    // Concavidad
    let sortedInfl = [...inflectionPoints].sort((m, n) => m - n);
    let concIntervals = [];
    if (sortedInfl.length === 0) {
        concIntervals.push({ min: -Infinity, max: Infinity });
    } else {
        concIntervals.push({ min: -Infinity, max: sortedInfl[0] });
        for (let i = 0; i < sortedInfl.length - 1; i++) {
            concIntervals.push({ min: sortedInfl[i], max: sortedInfl[i+1] });
        }
        concIntervals.push({ min: sortedInfl[sortedInfl.length - 1], max: Infinity });
    }
    
    // Monotonía
    monoIntervals.forEach((interval, idx) => {
        let testVal = 0;
        if (interval.min === -Infinity && interval.max === Infinity) {
            testVal = 0;
        } else if (interval.min === -Infinity) {
            testVal = interval.max - 1;
        } else if (interval.max === Infinity) {
            testVal = interval.min + 1;
        } else {
            testVal = (interval.min + interval.max) / 2;
        }
        
        let dfVal = evalPoly(dfCoefs, testVal);
        let label = dfVal > 0 ? "CRECIENTE" : "DECRECIENTE";
        let stateColor = dfVal > 0 ? "var(--color-success)" : "var(--color-danger)";
        let iconName = dfVal > 0 ? "trending-up" : "trending-down";
        
        let rangeStr = "";
        if (interval.min === -Infinity) rangeStr = `(-\\infty, ${interval.max.toFixed(2)})`;
        else if (interval.max === Infinity) rangeStr = `(${interval.min.toFixed(2)}, \\infty)`;
        else rangeStr = `(${interval.min.toFixed(2)}, ${interval.max.toFixed(2)})`;
        
        let card = document.createElement('div');
        card.className = 'interval-card';
        card.innerHTML = `
            <h5><i data-lucide="${iconName}"></i> Monotonía (Intervalo ${idx+1})</h5>
            <span class="interval-range">$${rangeStr}$</span>
            <div class="interval-status">
                La función es <strong style="color: ${stateColor};">${label}</strong>.
                <div style="font-size:0.75rem; margin-top:0.4rem; color:var(--text-muted);">
                    Evaluamos $x_t = ${testVal.toFixed(2)}$: <br>
                    $f'(${testVal.toFixed(2)}) = ${dfVal.toFixed(2)} ${dfVal > 0 ? '>' : '<'} 0$
                </div>
            </div>
        `;
        intervalGrid.appendChild(card);
    });
    
    // Concavidad
    concIntervals.forEach((interval, idx) => {
        let testVal = 0;
        if (interval.min === -Infinity && interval.max === Infinity) {
            testVal = 0;
        } else if (interval.min === -Infinity) {
            testVal = interval.max - 1;
        } else if (interval.max === Infinity) {
            testVal = interval.min + 1;
        } else {
            testVal = (interval.min + interval.max) / 2;
        }
        
        let ddfVal = evalPoly(ddfCoefs, testVal);
        let label = ddfVal > 0 ? "Cóncava hacia Arriba" : "Cóncava hacia Abajo";
        let stateColor = ddfVal > 0 ? "var(--color-secondary)" : "var(--color-warning)";
        let iconName = ddfVal > 0 ? "smile" : "frown";
        
        let rangeStr = "";
        if (interval.min === -Infinity) rangeStr = `(-\\infty, ${interval.max.toFixed(2)})`;
        else if (interval.max === Infinity) rangeStr = `(${interval.min.toFixed(2)}, \\infty)`;
        else rangeStr = `(${interval.min.toFixed(2)}, ${interval.max.toFixed(2)})`;
        
        let card = document.createElement('div');
        card.className = 'interval-card';
        card.innerHTML = `
            <h5><i data-lucide="${iconName}"></i> Concavidad (Intervalo ${idx+1})</h5>
            <span class="interval-range">$${rangeStr}$</span>
            <div class="interval-status">
                La curva es <strong style="color: ${stateColor};">${label}</strong>.
                <div style="font-size:0.75rem; margin-top:0.4rem; color:var(--text-muted);">
                    Evaluamos $x_t = ${testVal.toFixed(2)}$: <br>
                    $f''(${testVal.toFixed(2)}) = ${ddfVal.toFixed(2)} ${ddfVal > 0 ? '>' : '<'} 0$
                </div>
            </div>
        `;
        intervalGrid.appendChild(card);
    });
    
    lucide.createIcons();
    renderMathInElement(stepsDiv, { delimiters: [{left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false}] });
    renderMathInElement(intervalGrid, { delimiters: [{left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false}] });
}

function updateStep5(criticalPoints, inflectionPoints, coefs, dfCoefs) {
    const minVal = parseFloat(document.getElementById('table-range-min').value);
    const maxVal = parseFloat(document.getElementById('table-range-max').value);
    const stepVal = parseFloat(document.getElementById('table-step').value);
    
    const tbody = document.getElementById('table-values-tbody');
    tbody.innerHTML = '';
    
    let points = [];
    for (let x = minVal; x <= maxVal + 1e-9; x += stepVal) {
        points.push(x);
    }
    
    criticalPoints.forEach(p => {
        if (p >= minVal && p <= maxVal) {
            points.push(p);
        }
    });
    
    inflectionPoints.forEach(p => {
        if (p >= minVal && p <= maxVal) {
            points.push(p);
        }
    });
    
    points.sort((m, n) => m - n);
    
    let uniquePoints = [];
    for (let i = 0; i < points.length; i++) {
        if (uniquePoints.length === 0) {
            uniquePoints.push(points[i]);
        } else {
            let last = uniquePoints[uniquePoints.length - 1];
            if (Math.abs(points[i] - last) > 0.02) {
                uniquePoints.push(points[i]);
            }
        }
    }
    
    uniquePoints.forEach(x => {
        let y = evalPoly(coefs, x);
        let dfVal = evalPoly(dfCoefs, x);
        
        let rowClass = "";
        let statusTag = "";
        
        let isCrit = false;
        criticalPoints.forEach(cp => {
            if (Math.abs(x - cp) < 0.02) {
                isCrit = true;
            }
        });
        
        let isInfl = false;
        inflectionPoints.forEach(ip => {
            if (Math.abs(x - ip) < 0.02) {
                isInfl = true;
            }
        });
        
        if (isCrit) {
            rowClass = "critical-row";
            statusTag = `<span class="row-status-tag critical">Crítico (f' = 0)</span>`;
        } else if (isInfl) {
            rowClass = "inflection-row";
            statusTag = `<span class="row-status-tag inflection">Inflexión (f'' = 0)</span>`;
        }
        
        // substitution text builder
        let parts = [];
        let degrees = [4, 3, 2, 1, 0];
        for (let i = 0; i < coefs.length; i++) {
            let coef = coefs[i];
            let deg = degrees[degrees.length - coefs.length + i];
            if (Math.abs(coef) < 1e-9) continue;
            
            let valStr = "";
            if (deg > 0) {
                valStr = `(${x.toFixed(1)})^${deg}`;
            } else {
                valStr = "";
            }
            
            let termValStr = "";
            if (deg > 0) {
                termValStr = `${coef > 0 && parts.length > 0 ? '+' : ''}${coef}${valStr}`;
            } else {
                termValStr = `${coef > 0 && parts.length > 0 ? '+' : ''}${coef}`;
            }
            parts.push(termValStr);
        }
        let substText = parts.join("");
        
        let row = document.createElement('tr');
        if (rowClass) row.className = rowClass;
        row.innerHTML = `
            <td><strong>${x.toFixed(2)}</strong></td>
            <td><code style="font-family: var(--font-mono); font-size: 0.8rem;">${substText}</code></td>
            <td><strong>${y.toFixed(2)}</strong></td>
            <td>${dfVal.toFixed(2)}</td>
            <td>${statusTag}</td>
        `;
        tbody.appendChild(row);
    });
}

// --- Graphical Representation (Chart.js) ---
function drawChart(coefs, criticalPoints, inflectionPoints) {
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    // Generate data for function curve
    let curveData = [];
    for (let x = -12; x <= 12 + 1e-9; x += 0.1) {
        let y = evalPoly(coefs, x);
        curveData.push({ x: x, y: y });
    }
    
    // Categorize critical points into Maxima vs Minima
    let maxPoints = [];
    let minPoints = [];
    
    criticalPoints.forEach(xc => {
        let y = evalPoly(coefs, xc);
        let ddfVal = evalPoly(currentDdfCoefs, xc);
        if (ddfVal < -1e-5) {
            maxPoints.push({ x: xc, y: y });
        } else if (ddfVal > 1e-5) {
            minPoints.push({ x: xc, y: y });
        }
    });
    
    // Inflection points
    let inflData = inflectionPoints.map(xi => {
        return { x: xi, y: evalPoly(coefs, xi) };
    });
    
    // Tangent data (starts empty)
    let tangentData = [];
    
    const ctx = document.getElementById('function-canvas').getContext('2d');
    
    // Read theme details
    const isLight = document.body.getAttribute("data-theme") === "light";
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const axisColor = isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
    const textColor = isLight ? '#475569' : '#94a3b8';
    
    chartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Curva f(x)',
                    data: curveData,
                    showLine: true,
                    borderColor: '#6366f1',
                    borderWidth: 3.5,
                    pointRadius: 0,
                    tension: 0.1,
                    order: 5
                },
                {
                    label: 'Tangente Móvil',
                    data: tangentData,
                    showLine: true,
                    borderColor: '#f43f5e',
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    order: 1
                },
                {
                    label: 'Máximos',
                    data: maxPoints,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    order: 2
                },
                {
                    label: 'Mínimos',
                    data: minPoints,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    order: 3
                },
                {
                    label: 'Puntos de Inflexión',
                    data: inflData,
                    pointBackgroundColor: '#06b6d4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    order: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 400
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            let x = context.parsed.x.toFixed(2);
                            let y = context.parsed.y.toFixed(2);
                            return `${label}: (${x}, ${y})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'center',
                    min: -12,
                    max: 12,
                    grid: {
                        color: function(ctx) {
                            return ctx.tick.value === 0 ? axisColor : gridColor;
                        },
                        lineWidth: function(ctx) {
                            return ctx.tick.value === 0 ? 2 : 1;
                        }
                    },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit' },
                        stepSize: 2
                    }
                },
                y: {
                    type: 'linear',
                    position: 'center',
                    suggestedMin: -12,
                    suggestedMax: 12,
                    grid: {
                        color: function(ctx) {
                            return ctx.tick.value === 0 ? axisColor : gridColor;
                        },
                        lineWidth: function(ctx) {
                            return ctx.tick.value === 0 ? 2 : 1;
                        }
                    },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit' },
                        stepSize: 2
                    }
                }
            }
        }
    });
    
}

function updateInspectorValues(xVal, coefs, dfCoefs) {
    let yVal = evalPoly(coefs, xVal);
    let slope = evalPoly(dfCoefs, xVal);
    
    document.getElementById('ins-x').textContent = xVal.toFixed(2);
    document.getElementById('ins-y').textContent = yVal.toFixed(2);
    document.getElementById('ins-slope').textContent = slope.toFixed(2);
    
    let desc = "";
    const descEl = document.getElementById('ins-desc');
    
    if (Math.abs(slope) < 0.05) {
        desc = "Cresta/Valle (Plano)";
        descEl.style.color = 'var(--color-secondary)';
    } else if (slope > 0) {
        desc = "Creciente (Sube)";
        descEl.style.color = 'var(--color-success)';
    } else {
        desc = "Decreciente (Baja)";
        descEl.style.color = 'var(--color-danger)';
    }
    descEl.textContent = desc;
}

function drawTangentLine(x0, coefs, dfCoefs) {
    if (!chartInstance) return;
    
    let y0 = evalPoly(coefs, x0);
    let slope = evalPoly(dfCoefs, x0);
    
    // Generate a short tangent line segement
    let xMin = x0 - 1.5;
    let xMax = x0 + 1.5;
    
    let yMin = slope * (xMin - x0) + y0;
    let yMax = slope * (xMax - x0) + y0;
    
    chartInstance.data.datasets[1].data = [
        { x: xMin, y: yMin },
        { x: xMax, y: yMax }
    ];
    
    // Update without animation for raw performance
    chartInstance.update('none');
}

// --- Practice & Quiz Engine ---
let quizChartInstance = null;
let activeQuestions = [];
let currentQuestionIndex = 0;
let quizScore = 0;
let hasAnswered = false;
let selectedQuestionsCount = 5; // Default is 5

const quizQuestions = [
    {
        question: "¿Cuál es la derivada de $3\\text{sen}(5x)$?",
        options: [
            "$15\\cos(5x)$",
            "$3\\cos(5x)$",
            "$-15\\cos(5x)$",
            "$15\\text{sen}(5x)$"
        ],
        correct: 0,
        explanation: "Usamos la derivada de la función trigonométrica: $\\frac{d}{dx}[a\\,\\text{sen}(u)] = a\\cos(u) \\cdot u'$. Aquí, $a = 3$, $u = 5x$ y $u' = 5$. Por lo tanto, $y' = 3 \\cdot \\cos(5x) \\cdot 5 = 15\\cos(5x)$."
    },
    {
        question: "Si tienes la función $f(x) = (x-4)^{3/4}$, ¿cuál es su forma radical correspondiente?",
        options: [
            "$\\sqrt[3]{(x-4)^4}$",
            "$\\sqrt[4]{(x-4)^3}$",
            "$\\sqrt{(x-4)^{3/4}}$",
            "$\\sqrt[4]{x^3 - 4}$"
        ],
        correct: 1,
        explanation: "La regla de los exponentes fraccionarios dicta que $u^{m/n} = \\sqrt[n]{u^m}$. El denominador ($4$) representa el índice de la raíz y el numerador ($3$) es la potencia de la base. Así, $(x-4)^{3/4} = \\sqrt[4]{(x-4)^3}$."
    },
    {
        question: "Si al evaluar un punto crítico $x_c$ en la segunda derivada obtienes $f''(x_c) = 5.24 > 0$, ¿qué representa?",
        options: [
            "Un Máximo Local",
            "Un Mínimo Local",
            "Un Punto de Inflexión",
            "Una pendiente indeterminada"
        ],
        correct: 1,
        explanation: "Por el criterio de la segunda derivada, si $f''(x_c) > 0$, la gráfica se abre hacia arriba (cóncava hacia arriba, similar a una sonrisa), por lo que la parte baja del arco representa un <strong>Mínimo Local</strong>."
    },
    {
        question: "En la regla del cociente $\\frac{u'v - uv'}{v^2}$, ¿qué precaución elemental aconseja la guía?",
        options: [
            "Que no se puede derivar con bases negativas.",
            "Tener cuidado con el signo menos antes de $u \\cdot v'$ pues cambia el signo de todo ese resultado (usar paréntesis).",
            "Que la derivada de $v$ siempre es constante.",
            "Que el denominador es la derivada de la primera función."
        ],
        correct: 1,
        explanation: "El signo negativo afecta a toda la expresión $u \\cdot v'$ de la derecha. Olvidar poner paréntesis para resolver la multiplicación antes de cambiar los signos es uno de los errores algebraicos más usuales del examen."
    },
    {
        question: "¿Cuál es la derivada de la exponencial natural $e^{2x}$?",
        options: [
            "$e^{2x}$",
            "$2e^{2x}$",
            "$\\frac{1}{2}e^{2x}$",
            "$2x e^{2x-1}$"
        ],
        correct: 1,
        explanation: "La derivada de $e^u$ es $e^u \\cdot u'$. Para $u = 2x$, su derivada interna $u'$ es $2$. Reensamblando, la derivada completa es $2e^{2x}$."
    },
    {
        question: "De acuerdo a la Regla Maestra (Regla de la Potencia), ¿cuál es la derivada de $x^4$?",
        options: [
            "$4x^4$",
            "$3x^3$",
            "$4x^3$",
            "$x^3$"
        ],
        correct: 2,
        explanation: "La Regla Maestra indica que para derivar $x^n$, bajas el exponente $n$ a multiplicar y le restas 1 al exponente, quedando $n x^{n-1}$. Para $x^4$, el resultado es $4x^{4-1} = 4x^3$."
    },
    {
        question: "¿Cuál es la derivada de una constante pura, como el número $8$?",
        options: [
            "$8$",
            "$1$",
            "$0$",
            "$x$"
        ],
        correct: 2,
        explanation: "Una constante no cambia (su tasa de cambio es nula). Por lo tanto, la derivada de cualquier número constante solo siempre es **CERO** ($0$)."
    },
    {
        question: "Si una función es $f(x) = -6x$, ¿cuál es su derivada?",
        options: [
            "$-6$",
            "$0$",
            "$-6x$",
            "$-1$"
        ],
        correct: 0,
        explanation: "Para cualquier término de la forma $c x$ (donde el exponente de $x$ es 1), la derivada es simplemente el coeficiente $c$. En este caso, $-6$."
    },
    {
        question: "¿Cuál es la derivada de la función $f(x) = x \\cdot \\text{sen}(x)$ aplicando la regla del producto?",
        options: [
            "$\\cos(x)$",
            "$\\text{sen}(x) + x\\cos(x)$",
            "$x\\cos(x)$",
            "$\\text{sen}(x) - x\\cos(x)$"
        ],
        correct: 1,
        explanation: "Llamamos $u = x$ y $v = \\text{sen}(x)$. Sus derivadas son $u' = 1$ y $v' = \\cos(x)$. Aplicando la regla $(u'v + uv')$, obtenemos $(1 \\cdot \\text{sen}(x)) + (x \\cdot \\cos(x)) = \\text{sen}(x) + x\\cos(x)$."
    },
    {
        question: "Deriva la función $f(x) = \\frac{x}{x+1}$ usando la regla del cociente. ¿Cuál es el resultado?",
        options: [
            "$\\frac{1}{(x+1)^2}$",
            "$\\frac{2x+1}{(x+1)^2}$",
            "$\\frac{1}{x+1}$",
            "$\\frac{-1}{(x+1)^2}$"
        ],
        correct: 0,
        explanation: "Llamamos $u = x$ y $v = x+1$. Derivadas: $u'=1$, $v'=1$. Aplicamos $\\frac{u'v - uv'}{v^2} = \\frac{1(x+1) - x(1)}{(x+1)^2} = \\frac{x + 1 - x}{(x+1)^2} = \\frac{1}{(x+1)^2}$."
    },
    {
        question: "Usando la regla de la cadena, ¿cuál es la derivada de $y = (2x-5)^3$?",
        options: [
            "$3(2x-5)^2$",
            "$6(2x-5)^2$",
            "$2(2x-5)^2$",
            "$6x(2x-5)^2$"
        ],
        correct: 1,
        explanation: "Derivamos de afuera hacia adentro: 1) Baja el 3 multiplicando el paréntesis intacto elevado a la 2: $3(2x-5)^2$. 2) Multiplica por la derivada de lo de adentro ($2$). El resultado es $3(2x-5)^2 \\cdot 2 = 6(2x-5)^2$."
    },
    {
        question: "¿Cuál es la derivada de $y = \\cos(3x^2)$?",
        options: [
            "$-6x\\text{sen}(3x^2)$",
            "$6x\\text{sen}(3x^2)$",
            "$-6x\\cos(3x^2)$",
            "$-\\text{sen}(3x^2)$"
        ],
        correct: 0,
        explanation: "La derivada de $\\cos(u)$ es $-\\text{sen}(u) \\cdot u'$. Para $u = 3x^2$, la derivada interna $u'$ es $6x$. Por lo tanto, la derivada total es $-\\text{sen}(3x^2) \\cdot 6x = -6x\\text{sen}(3x^2)$."
    },
    {
        question: "Calcula la derivada de $y = 10^{x^2}$.",
        options: [
            "$2x \\cdot 10^{x^2}$",
            "$10^{x^2} \\cdot \\ln(10)$",
            "$2x \\cdot 10^{x^2} \\cdot \\ln(10)$",
            "$x^2 \\cdot 10^{x^2-1}$"
        ],
        correct: 2,
        explanation: "La derivada de $a^u$ es $a^u \\cdot \\ln(a) \\cdot u'$. Con $a = 10$, $u = x^2$ y $u' = 2x$, obtenemos $10^{x^2} \\cdot \\ln(10) \\cdot 2x = 2x \\cdot 10^{x^2} \\cdot \\ln(10)$."
    },
    {
        question: "Aplica la fórmula de derivación para obtener la derivada de $y = \\log_{10}(3x)$.",
        options: [
            "$\\frac{1}{x\\ln(10)}$",
            "$\\frac{3}{x\\ln(10)}$",
            "$\\frac{1}{3x\\ln(10)}$",
            "$\\frac{\\ln(10)}{x}$"
        ],
        correct: 0,
        explanation: "La derivada de $\\log_{a}(u)$ es $\\frac{u'}{u\\ln(a)}$. Aquí $a = 10$, $u = 3x$ y $u' = 3$. La derivada es $\\frac{3}{3x\\ln(10)} = \\frac{1}{x\\ln(10)}$."
    },
    {
        question: "¿Cuál es la derivada de $y = \\ln(x^4)$?",
        options: [
            "$\\frac{1}{x^4}$",
            "$\\frac{4}{x}$",
            "$\\frac{4}{x^4}$",
            "$\\frac{1}{x}$"
        ],
        correct: 1,
        explanation: "La derivada de $\\ln(u)$ es $\\frac{u'}{u}$. Aquí $u = x^4$ y $u' = 4x^3$. Reensamblando: $\\frac{4x^3}{x^4} = \\frac{4}{x}$. También podías aplicar leyes de logaritmos: $\\ln(x^4) = 4\\ln(x)$, cuya derivada es $4 \\cdot \\frac{1}{x} = \\frac{4}{x}$."
    },
    {
        question: "¿Cómo se define conceptualmente un punto crítico de una función $f(x)$?",
        options: [
            "Un valor de $x$ donde la función vale $0$.",
            "Un valor de $x$ donde la primera derivada $f'(x) = 0$ o no está definida.",
            "Un valor de $x$ donde la segunda derivada es mayor que $0$.",
            "Un punto donde la función cambia de cóncava a convexa."
        ],
        correct: 1,
        explanation: "Los puntos críticos de una función continua ocurren en las coordenadas de su dominio donde su tasa de cambio instantánea es nula ($f'(x) = 0$) o no se puede definir."
    },
    {
        question: "¿Qué condición debe cumplir un punto de inflexión en una función?",
        options: [
            "Que $f'(x) = 0$.",
            "Que $f''(x) = 0$ y cambie la concavidad (el signo de la segunda derivada) a sus lados.",
            "Que la función sea decreciente.",
            "Que sea un máximo o un mínimo local simultáneamente."
        ],
        correct: 1,
        explanation: "El punto de inflexión indica un cambio en el sentido de curvatura (de cóncava a convexa o viceversa), lo cual ocurre donde la segunda derivada es nula ($f''(x) = 0$) y cruza el eje horizontal cambiando de signo."
    },
    {
        question: "Si en un intervalo $(a,b)$ la primera derivada es estrictamente negativa ($f'(x) < 0$), ¿cómo es el comportamiento de la función?",
        options: [
            "Es creciente.",
            "Es decreciente.",
            "Es cóncava hacia arriba.",
            "Es constante."
        ],
        correct: 1,
        explanation: "Una primera derivada negativa ($f'(x) < 0$) indica que la pendiente de la recta tangente es negativa, por lo que la función decrece a medida que avanzamos hacia la derecha."
    },
    {
        question: "Si en un intervalo $(a,b)$ se cumple que la segunda derivada es negativa ($f''(x) < 0$), la gráfica de la función es:",
        options: [
            "Cóncava hacia arriba (abierta hacia arriba).",
            "Cóncava hacia abajo (abierta hacia abajo o convexa).",
            "Creciente.",
            "Indeterminada."
        ],
        correct: 1,
        explanation: "Una segunda derivada negativa ($f''(x) < 0$) representa que la pendiente del gráfico disminuye continuamente, lo que da como resultado una curvatura cóncava hacia abajo (abierta hacia abajo, cóncava o convexa)."
    },
    {
        question: "Convierte el radical $\\sqrt{(x-2)^5}$ a su formato de exponente fraccionario correspondiente.",
        options: [
            "$(x-2)^{2/5}$",
            "$(x-2)^{5/2}$",
            "$(x-2)^{1/5}$",
            "$(x-2)^5$"
        ],
        correct: 1,
        explanation: "La regla de conversión es $\\sqrt[q]{u^p} = u^{p/q}$. En este caso, la raíz es cuadrada ($q=2$) y la potencia interna es $p=5$, lo que resulta en $(x-2)^{5/2}$."
    },
    {
        question: "Observa la gráfica de la función cuadrática $f(x) = x^2 + 6x + 8$. ¿En qué coordenadas se localiza su punto crítico (mínimo local)?",
        options: [
            "$(-3, -1)$",
            "$(3, 35)$",
            "$(-3, 0)$",
            "$(0, 8)$"
        ],
        correct: 0,
        explanation: "La derivada es $f'(x) = 2x + 6$. Igualando a 0: $2x + 6 = 0 \\implies x = -3$. Evaluando en la función original: $f(-3) = (-3)^2 + 6(-3) + 8 = 9 - 18 + 8 = -1$. El punto crítico es $(-3, -1)$, visible como el vértice de la parábola.",
        graph: { coefs: [0, 0, 1, 6, 8], criticalPoints: [-3], range: [-7, 1] }
    },
    {
        question: "Dada la gráfica de la función $f(x) = x^2 - 4x$. Observa la recta tangente en verde dibujada en $x = 1$. ¿Cuál es el valor de su pendiente (es decir, $f'(1)$)?",
        options: [
            "$2$",
            "$-2$",
            "$0$",
            "$-3$"
        ],
        correct: 1,
        explanation: "La derivada de la función es $f'(x) = 2x - 4$. Al evaluar en $x = 1$, obtenemos $f'(1) = 2(1) - 4 = -2$. Esto coincide con la pendiente negativa de la recta tangente punteada.",
        graph: { coefs: [0, 0, 1, -4, 0], tangentAt: 1, range: [-2, 4] }
    },
    {
        question: "Observa la gráfica de la función cúbica $f(x) = x^3 - 3x$. ¿Cuáles son las abscisas ($x$) de sus dos puntos críticos?",
        options: [
            "$x = -1$ y $x = 1$",
            "$x = 0$ y $x = 3$",
            "$x = -3$ y $x = 3$",
            "$x = -2$ y $x = 2$"
        ],
        correct: 0,
        explanation: "Derivando, $f'(x) = 3x^2 - 3$. Al igualar a cero: $3(x^2 - 1) = 0 \\implies x = 1$ y $x = -1$. En la gráfica, estos corresponden a la cima del máximo local ($x = -1$) y el fondo del mínimo local ($x = 1$).",
        graph: { coefs: [0, 1, 0, -3, 0], criticalPoints: [-1, 1], range: [-3, 3] }
    },
    {
        question: "Dada la gráfica de $f(x) = x^3 - 3x^2$, se muestra un punto de inflexión en color cian. ¿Cuál es la abscisa ($x$) de dicho punto?",
        options: [
            "$x = 0$",
            "$x = 1$",
            "$x = 2$",
            "$x = -1$"
        ],
        correct: 1,
        explanation: "La primera derivada es $3x^2 - 6x$, y la segunda derivada es $6x - 6$. Igualando a 0: $6x - 6 = 0 \\implies x = 1$. En la gráfica, es el punto en $(1, -2)$ donde la parábola cambia de ser cóncava hacia abajo a cóncava hacia arriba.",
        graph: { coefs: [0, 1, -3, 0, 0], inflectionPoints: [1], range: [-2, 4] }
    },
    {
        question: "Observa la gráfica de la función $f(x) = 4 - x^2$. ¿En qué intervalo de $x$ la función es creciente ($f'(x) > 0$)?",
        options: [
            "$(-\\infty, 0)$",
            "$(0, \\infty)$",
            "$(-2, 2)$",
            "En ningún intervalo"
        ],
        correct: 0,
        explanation: "La función va 'hacia arriba' a medida que nos movemos de izquierda a derecha hasta llegar al punto crítico en $x = 0$. Su derivada $f'(x) = -2x$ es positiva para cualquier valor negativo de $x$, es decir, en el intervalo $(-\\infty, 0)$.",
        graph: { coefs: [0, 0, -1, 0, 4], range: [-3, 3] }
    },
    {
        question: "Observa la gráfica de $f(x) = x^3$. ¿Cuál es la concavidad de la función en el intervalo $(0, \\infty)$?",
        options: [
            "Cóncava hacia abajo (abierta hacia abajo)",
            "Cóncava hacia arriba (abierta hacia arriba)",
            "Es plana (lineal)",
            "No tiene concavidad"
        ],
        correct: 1,
        explanation: "La segunda derivada es $f''(x) = 6x$. Para cualquier valor en el intervalo $(0, \\infty)$, la segunda derivada es estrictamente positiva ($6x > 0$), por lo que la gráfica es cóncava hacia arriba (tiene forma de cuenco abierto hacia arriba).",
        graph: { coefs: [0, 1, 0, 0, 0], inflectionPoints: [0], range: [-3, 3] }
    },
    {
        question: "Si $f(x) = x^2$, ¿cuál es el valor de la derivada en $x = 3$, es decir, $f'(3)$?",
        options: [
            "$9$",
            "$6$",
            "$3$",
            "$0$"
        ],
        correct: 1,
        explanation: "La derivada general es $f'(x) = 2x$. Al sustituir $x = 3$ en la derivada, obtenemos $f'(3) = 2(3) = 6$. Esto representa la pendiente de la recta tangente al gráfico de $x^2$ en la coordenada de abscisa 3."
    },
    {
        question: "Si derivamos un término constante por una función $\\frac{d}{dx}[c \\cdot u]$, la regla nos dice que es igual a:",
        options: [
            "$c \\cdot u'$",
            "$0$",
            "$c' \\cdot u'$",
            "$c \\cdot u' + c' \\cdot u$"
        ],
        correct: 0,
        explanation: "La constante $c$ 'sale' de la operación de derivada. Derivas la función $u$ y la multiplicas por el coeficiente original, obteniendo $c \\cdot u'$."
    },
    {
        question: "¿Cuál es la derivada de la función trigonométrica $y = \\tan(u)$?",
        options: [
            "$\\sec^2(u) \\cdot u'$",
            "$-\\csc^2(u) \\cdot u'$",
            "$\\sec(u) \\cdot u'$",
            "$\\cos(u) \\cdot u'$"
        ],
        correct: 0,
        explanation: "La derivada de la función tangente de un argumento $u(x)$ es la secante cuadrada de ese mismo argumento multiplicada por la derivada interna del argumento ($u'$)."
    },
    {
        question: "Usando exponentes fraccionarios para reescribir la raíz, ¿cuál es la derivada de $f(x) = \\sqrt{x}$?",
        options: [
            "$\\frac{1}{2\\sqrt{x}}$",
            "$\\frac{1}{2}x^{1/2}$",
            "$2\\sqrt{x}$",
            "$\\frac{1}{x^{1/2}}$"
        ],
        correct: 0,
        explanation: "Reescribimos $f(x) = x^{1/2}$. Derivando: $\\frac{1}{2}x^{1/2 - 1} = \\frac{1}{2}x^{-1/2} = \\frac{1}{2x^{1/2}} = \\frac{1}{2\\sqrt{x}}$."
    }
];

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function drawQuizChart(config) {
    const canvas = document.getElementById('quiz-chart-canvas');
    if (!canvas) return;
    
    if (quizChartInstance) {
        quizChartInstance.destroy();
        quizChartInstance = null;
    }
    
    // Show container
    const container = document.getElementById('quiz-chart-container');
    if (container) {
        container.style.display = 'block';
    }
    
    const ctx = canvas.getContext('2d');
    
    // Default range
    const minX = config.range ? config.range[0] : -5;
    const maxX = config.range ? config.range[1] : 5;
    
    // Generate function curve data
    let curveData = [];
    const step = (maxX - minX) / 100;
    for (let x = minX; x <= maxX + 1e-9; x += step) {
        let y = evalPoly(config.coefs, x);
        curveData.push({ x: x, y: y });
    }
    
    let datasets = [];
    
    // Main curve
    datasets.push({
        label: config.label || 'f(x)',
        data: curveData,
        showLine: true,
        borderColor: '#6366f1',
        borderWidth: 3,
        pointRadius: 0,
        tension: 0.15,
        order: 5
    });
    
    // Highlight points
    if (config.points) {
        config.points.forEach((pt, index) => {
            datasets.push({
                label: pt.label || `Punto ${index + 1}`,
                data: [{ x: pt.x, y: pt.y }],
                pointBackgroundColor: pt.color || '#f43f5e',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                order: 1
            });
        });
    }
    
    // Highlight critical points
    if (config.criticalPoints) {
        let maxPoints = [];
        let minPoints = [];
        
        config.criticalPoints.forEach(xc => {
            let y = evalPoly(config.coefs, xc);
            const dfCoefs = derivePoly(config.coefs);
            const ddfCoefs = derivePoly(dfCoefs);
            let ddfVal = evalPoly(ddfCoefs, xc);
            
            if (ddfVal < -1e-5) {
                maxPoints.push({ x: xc, y: y });
            } else if (ddfVal > 1e-5) {
                minPoints.push({ x: xc, y: y });
            } else {
                maxPoints.push({ x: xc, y: y });
            }
        });
        
        if (maxPoints.length > 0) {
            datasets.push({
                label: 'Máximos',
                data: maxPoints,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                order: 2
            });
        }
        
        if (minPoints.length > 0) {
            datasets.push({
                label: 'Mínimos',
                data: minPoints,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                order: 3
            });
        }
    }
    
    // Highlight inflection points
    if (config.inflectionPoints) {
        let inflPoints = config.inflectionPoints.map(xi => {
            return { x: xi, y: evalPoly(config.coefs, xi) };
        });
        if (inflPoints.length > 0) {
            datasets.push({
                label: 'Inflexión',
                data: inflPoints,
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                order: 4
            });
        }
    }
    
    // Draw tangent line
    if (config.tangentAt !== undefined) {
        const xt = config.tangentAt;
        const yt = evalPoly(config.coefs, xt);
        const dfCoefs = derivePoly(config.coefs);
        const slope = evalPoly(dfCoefs, xt);
        
        let tangentPoints = [];
        const tMinX = xt - 1.5;
        const tMaxX = xt + 1.5;
        tangentPoints.push({ x: tMinX, y: slope * (tMinX - xt) + yt });
        tangentPoints.push({ x: tMaxX, y: slope * (tMaxX - xt) + yt });
        
        datasets.push({
            label: 'Tangente',
            data: tangentPoints,
            showLine: true,
            borderColor: '#10b981',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            order: 6
        });
    }
    
    const isLight = document.body.getAttribute("data-theme") === "light";
    const gridColor = isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
    const axisColor = isLight ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)';
    const textColor = isLight ? '#475569' : '#94a3b8';
    
    quizChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: { datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: minX,
                    max: maxX,
                    grid: {
                        color: (context) => {
                            if (context.tick.value === 0) return axisColor;
                            return gridColor;
                        },
                        lineWidth: (context) => {
                            if (context.tick.value === 0) return 2;
                            return 1;
                        }
                    },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit', size: 10 }
                    }
                },
                y: {
                    type: 'linear',
                    grid: {
                        color: (context) => {
                            if (context.tick.value === 0) return axisColor;
                            return gridColor;
                        },
                        lineWidth: (context) => {
                            if (context.tick.value === 0) return 2;
                            return 1;
                        }
                    },
                    ticks: {
                        color: textColor,
                        font: { family: 'Outfit', size: 10 }
                    }
                }
            }
        }
    });
}

function hideQuizChart() {
    const container = document.getElementById('quiz-chart-container');
    if (container) {
        container.style.display = 'none';
    }
    if (quizChartInstance) {
        quizChartInstance.destroy();
        quizChartInstance = null;
    }
}

function initializeQuiz() {
    const startBtn = document.getElementById("quiz-start-btn");
    const nextBtn = document.getElementById("quiz-next-btn");
    const restartBtn = document.getElementById("quiz-restart-btn");
    const diffButtons = document.querySelectorAll(".btn-diff");
    
    // Difficulty selectors
    diffButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            diffButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            selectedQuestionsCount = parseInt(btn.getAttribute("data-questions")) || 5;
        });
    });
    
    // Start quiz
    startBtn.addEventListener("click", startQuizSession);
    
    // Actions
    nextBtn.addEventListener("click", handleNextQuestion);
    restartBtn.addEventListener("click", restartQuiz);
}

function startQuizSession() {
    // Hide setup screen
    document.getElementById("quiz-setup").style.display = "none";
    
    // Show active components
    document.getElementById("quiz-header").style.display = "flex";
    document.getElementById("question-block").style.display = "flex";
    document.getElementById("quiz-actions").style.display = "flex";
    
    // Filter / shuffle questions
    const shuffledPool = shuffleArray(quizQuestions);
    activeQuestions = shuffledPool.slice(0, selectedQuestionsCount);
    
    // Set parameters
    currentQuestionIndex = 0;
    quizScore = 0;
    document.getElementById("quiz-score").textContent = "0";
    document.getElementById("quiz-total-q").textContent = activeQuestions.length;
    
    loadQuestion();
}

function loadQuestion() {
    hasAnswered = false;
    
    const currQ = activeQuestions[currentQuestionIndex];
    
    // Update progress
    document.getElementById("quiz-curr-q").textContent = currentQuestionIndex + 1;
    const progressFill = document.getElementById("quiz-progress-bar");
    progressFill.style.width = `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`;
    
    // Set Question text
    const qTextEl = document.getElementById("question-text");
    qTextEl.textContent = currQ.question;
    
    // Render graph if available
    if (currQ.graph) {
        drawQuizChart(currQ.graph);
    } else {
        hideQuizChart();
    }
    
    // Clear & load Options
    const optContainer = document.getElementById("options-container");
    optContainer.innerHTML = '';
    
    currQ.options.forEach((optText, idx) => {
        const btn = document.createElement("button");
        btn.className = "option-btn";
        btn.textContent = optText;
        btn.addEventListener("click", () => handleOptionSelection(idx, btn));
        optContainer.appendChild(btn);
    });
    
    // Hide explanation & next button
    document.getElementById("quiz-explanation").style.display = "none";
    document.getElementById("quiz-next-btn").style.display = "none";
    
    // Render math in options & question
    renderMathInElement(document.getElementById("question-block"), {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
        ]
    });
}

function handleOptionSelection(selectedIdx, selectedBtn) {
    if (hasAnswered) return;
    hasAnswered = true;
    
    const currQ = activeQuestions[currentQuestionIndex];
    const optionBtns = document.querySelectorAll(".option-btn");
    
    if (selectedIdx === currQ.correct) {
        selectedBtn.classList.add("correct");
        quizScore++;
        document.getElementById("quiz-score").textContent = quizScore;
    } else {
        selectedBtn.classList.add("incorrect");
        optionBtns[currQ.correct].classList.add("correct");
    }
    
    // Show explanation
    const expText = document.getElementById("quiz-explanation-text");
    expText.innerHTML = currQ.explanation;
    document.getElementById("quiz-explanation").style.display = "block";
    
    renderMathInElement(document.getElementById("quiz-explanation"), {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
        ]
    });
    
    // Show next button
    document.getElementById("quiz-next-btn").style.display = "block";
}

function handleNextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < activeQuestions.length) {
        loadQuestion();
    } else {
        showQuizFinished();
    }
}

function showQuizFinished() {
    // Hide question block & actions
    document.getElementById("question-block").style.display = "none";
    document.getElementById("quiz-actions").style.display = "none";
    document.getElementById("quiz-header").style.display = "none";
    hideQuizChart();
    
    // Show finished block
    const finishedBlock = document.getElementById("quiz-finished");
    finishedBlock.style.display = "flex";
    
    const finalGradeVal = Math.round((quizScore / activeQuestions.length) * 10);
    const finalGradeEl = document.getElementById("final-grade");
    finalGradeEl.textContent = `${finalGradeVal}/10`;
    
    const verdictEl = document.getElementById("final-verdict");
    let baseText = `Acertaste ${quizScore} de ${activeQuestions.length} preguntas. `;
    if (finalGradeVal === 10) {
        verdictEl.textContent = baseText + "¡Perfecto! Dominas al 100% todos los conceptos y reglas de derivación. ¡Sacarás un 10 en tu examen!";
    } else if (finalGradeVal >= 8) {
        verdictEl.textContent = baseText + "¡Muy bien hecho! Tienes un excelente entendimiento del cálculo de funciones. Solo repasa los pequeños detalles.";
    } else if (finalGradeVal >= 6) {
        verdictEl.textContent = baseText + "¡Aprobado! Has comprendido lo fundamental, pero vale la pena repasar el Acordeón e intentar la tabulación interactiva de nuevo.";
    } else {
        verdictEl.textContent = baseText + "Aún te falta práctica. Te recomendamos repasar los 'Tips Rápidos' y practicar con los casos del Analizador interactivo.";
    }
}

function restartQuiz() {
    document.getElementById("quiz-finished").style.display = "none";
    
    // Reset back to setup screen
    document.getElementById("quiz-setup").style.display = "flex";
    
    // Reset values
    quizScore = 0;
    document.getElementById("quiz-score").textContent = "0";
}

// --- Floating Glossary & Interactive Terms ---
function initializeGlossary() {
    const trigger = document.getElementById("glossary-trigger");
    const panel = document.getElementById("glossary-panel");
    const closeBtn = document.getElementById("glossary-close");
    
    if (trigger && panel && closeBtn) {
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            panel.classList.toggle("active");
        });
        
        closeBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            panel.classList.remove("active");
        });
        
        document.addEventListener("click", (e) => {
            if (!panel.contains(e.target) && e.target !== trigger) {
                panel.classList.remove("active");
            }
        });
    }

    document.querySelectorAll(".legend-item").forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            const term = item.getAttribute("data-term");
            if (!term) return;

            const targetEl = document.getElementById(`glossary-term-${term}`);
            if (targetEl && panel) {
                panel.classList.add("active");

                setTimeout(() => {
                    targetEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
                    
                    targetEl.classList.remove("highlighted");
                    void targetEl.offsetWidth; // Force reflow
                    targetEl.classList.add("highlighted");
                }, 100);
            }
        });
    });
}
