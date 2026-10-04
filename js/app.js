import { getTodayContext, getRecommendation, analyzePatterns } from './analyticsEngine.js';
import { initData, TodayPlan, UserProfile, ProfileData, ExerciseDB, WorkoutHistory, DietData, AvailableTrainers, WorkoutPlans } from './mockData.js';

// --- Simple Router ---
const routes = {
    'home': renderHome,
    'timeline': renderTimeline,
    'insights': renderInsights,
    'train': renderTrain,
    'profile': renderProfile,
    'settings': renderSettings,
    'knowledge_base': renderKnowledgeBase,
    'knowledge_exercises': renderKnowledgeExercises,
    'expert_plans': renderExpertPlans,
    'knowledge_articles': renderKnowledgeArticles,
    'knowledge_base_detail': renderKnowledgeBaseDetail,
    'camera_feedback': renderCameraFeedback,
    'history': renderHistory,
    'exercise_stats': renderExerciseStats,
    'diet': renderDiet,
    'find_trainer': renderFindTrainer,
    'community': renderCommunity,
    'symptom_tracker': renderSymptomTracker,
    'doctor_report': renderDoctorReport,
    'clients': renderClients
};

// Application state for passing data between views
const appState = {
    selectedWorkout: null,
    selectedExercise: null,
    selectedKBItem: null,
    isTrainer: false
};

let currentRoute = 'home';

function navigate(route) {
    currentRoute = route;
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function render() {
    const app = document.getElementById('app');
    
    let sc = document.getElementById('screen-container');
    let nc = document.getElementById('nav-container');
    
    if (!sc) {
        app.innerHTML = '';
        sc = document.createElement('div');
        sc.id = 'screen-container';
        
        nc = document.createElement('div');
        nc.id = 'nav-container';
        
        app.appendChild(sc);
        app.appendChild(nc);
    }
    
    // Replace screen
    sc.innerHTML = '';
    const screen = routes[currentRoute]();
    sc.appendChild(screen);
    
    // Bottom nav handling to prevent flickering
    const needsNav = ['home', 'knowledge_base', 'knowledge_exercises', 'expert_plans', 'knowledge_articles', 'train', 'profile', 'settings', 'clients'].includes(currentRoute);
    
    if (needsNav) {
        if (!nc.firstChild) {
            nc.appendChild(renderBottomNav());
        }
        updateBottomNavState();
    } else {
        nc.innerHTML = '';
    }
}

function updateBottomNavState() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    
    const isKnowledge = ['knowledge_base', 'knowledge_exercises', 'expert_plans', 'knowledge_articles'].includes(currentRoute);
    const isProfile = ['profile', 'settings', 'clients'].includes(currentRoute);
    const isTrain = ['train', 'camera_feedback'].includes(currentRoute);
    
    const buttons = nav.querySelectorAll('.nav-item');
    if (buttons.length < 4) return;
    
    const setBtnState = (btn, isActive, baseIcon) => {
        btn.className = 'nav-item ' + (isActive ? 'active' : '');
        btn.querySelector('i').className = isActive ? 'ph-fill ' + baseIcon : 'ph ' + baseIcon;
    };
    
    setBtnState(buttons[0], currentRoute === 'home', 'ph-house');
    setBtnState(buttons[1], isKnowledge, 'ph-book-open');
    setBtnState(buttons[2], isTrain, 'ph-barbell');
    setBtnState(buttons[3], isProfile, 'ph-user');
}

// --- UI Components ---
function createEl(tag, className, innerHTML = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.innerHTML = innerHTML;
    return el;
}

// --- Views ---

function renderHome() {
    const container = createEl('div', 'screen');
    const header = createEl('div', 'mb-6');
    header.innerHTML = `
        <h1 class="text-3xl font-bold">Good morning, ${UserProfile.name}.</h1>
        <p class="text-muted mt-2">Here is your context for today.</p>
    `;
    container.appendChild(header);

    // Context Grid
    const today = getTodayContext();
    // Diet calculations
    const totalKcal = DietData.entries.reduce((sum, entry) => sum + entry.kcal, 0);
    const macros = DietData.macros;

    const contextGrid = createEl('div', 'today-context-grid mb-6');
    contextGrid.innerHTML = `
        <div class="context-item">
            <div class="context-icon"><i class="ph-fill ph-moon text-primary"></i></div>
            <div>
                <div class="text-xs text-muted font-semibold uppercase">Sleep</div>
                <div class="font-bold flex items-center gap-2">${today.sleep}h <span class="text-xs text-danger">↓</span></div>
            </div>
        </div>
        <div class="context-item" onclick="window.navigate('diet')" style="cursor: pointer;">
            <div class="context-icon text-warning"><i class="ph-fill ph-fire"></i></div>
            <div>
                <div class="text-xs text-muted font-semibold uppercase">Calories</div>
                <div class="font-bold text-warning">${totalKcal} kcal</div>
            </div>
        </div>
        <div class="context-item" onclick="window.navigate('diet')" style="cursor: pointer;">
            <div class="context-icon text-success"><i class="ph-fill ph-chart-pie-slice"></i></div>
            <div>
                <div class="text-xs text-muted font-semibold uppercase">Macros</div>
                <div class="font-bold text-success text-sm">${macros.protein}%P / ${macros.carbs}%C</div>
            </div>
        </div>
        <div class="context-item" onclick="window.navigate('history')" style="cursor: pointer;">
            <div class="context-icon text-danger"><i class="ph-fill ph-barbell"></i></div>
            <div>
                <div class="text-xs text-muted font-semibold uppercase">Recent Load</div>
                <div class="font-bold text-danger">High</div>
            </div>
        </div>
    `;
    container.appendChild(contextGrid);

    // AI Recommendation
    const rec = getRecommendation();
    const recCard = createEl('div', 'card glass');
    
    let planHtml = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg">Today's planned workout:</h2>
            <span class="badge badge-blue">${TodayPlan.duration} min</span>
        </div>
        <p class="font-semibold text-xl mb-6">${TodayPlan.title}</p>
    `;

    if (rec.type === "ADAPTATION") {
        planHtml = `
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-lg text-muted line-through">Planned: ${TodayPlan.title} (${TodayPlan.duration}m)</h2>
            </div>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-lg text-primary font-bold">Recommended:</h2>
                <span class="badge badge-green">${rec.action.duration} min</span>
            </div>
            <p class="font-bold text-2xl mb-4">${rec.title}</p>
            
            <button class="drawer-toggle mb-4" id="toggle-why">
                <i class="ph ph-info"></i> Why this recommendation?
            </button>
            <div class="insight-drawer mb-4" id="why-drawer">
                ${rec.rationale.map(r => `
                    <div class="flex justify-between text-sm mb-2">
                        <span class="text-muted">${r.factor}</span>
                        <span class="font-semibold">${r.text}</span>
                    </div>
                `).join('')}
                <div class="mt-4 pt-4 border-t border-color" style="border-top: 1px solid var(--border-color);">
                    <span class="text-xs text-muted uppercase">Confidence:</span>
                    <span class="badge badge-yellow ml-2">Medium</span>
                </div>
            </div>
            <button class="btn btn-primary w-full" style="width: 100%" onclick="window.startWorkout()">Start Adapted Session</button>
            <button class="btn btn-outline w-full mt-3" style="width: 100%">Stick to original plan</button>
        `;
    }

    recCard.innerHTML = planHtml;
    container.appendChild(recCard);

    // Wellbeing Quick Check
    const checkinCard = createEl('div', 'card mt-6');
    checkinCard.innerHTML = `
        <h2 class="text-md mb-4 font-semibold flex items-center gap-2"><i class="ph ph-heartbeat"></i> Quick Check-in</h2>
        <div class="slider-container">
            <label>How are you feeling right now?</label>
            <input type="range" id="wellbeing-slider" min="1" max="10" value="5">
            <div class="flex justify-between text-xs text-muted mt-1">
                <span>Exhausted</span>
                <span>Great</span>
            </div>
        </div>
        <button class="btn btn-secondary w-full" id="btn-log-wellbeing" style="width: 100%; padding: 8px;">Log check-in</button>
    `;
    
    setTimeout(() => {
        const btn = document.getElementById('btn-log-wellbeing');
        if (btn) {
            btn.onclick = async () => {
                const energy = parseInt(document.getElementById('wellbeing-slider').value);
                btn.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Saving...';
                await fetch('/api/wellbeing', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ energy })
                });
                btn.innerHTML = '<i class="ph ph-check" style="color: var(--success)"></i> Logged';
                btn.disabled = true;
            };
        }
    }, 0);
    
    container.appendChild(checkinCard);

    return container;
}

function renderTimeline() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <h1 class="text-2xl font-bold mb-6">Health Timeline</h1>
        
        <div class="card glass mb-6">
            <div class="flex gap-3 mb-2">
                <i class="ph ph-sparkle text-primary text-xl"></i>
                <h3 class="font-semibold">AI Insight</h3>
            </div>
            <p class="text-sm">This week you completed 3 sessions. The two highest-volume sessions were followed by higher reported fatigue. Your strongest logged performance occurred after a night with sleep above your recent average.</p>
        </div>

        <div style="border-left: 2px solid var(--surface-200); padding-left: 16px; margin-left: 8px;" class="flex-col gap-6">
            <!-- Timeline items mocked for demo -->
            <div class="relative">
                <div style="position:absolute; left:-25px; top:0; width:16px; height:16px; border-radius:50%; background:var(--bg-dark); border:2px solid var(--accent-primary);"></div>
                <div class="text-xs text-muted mb-1 font-bold">TODAY</div>
                <div class="card p-3 mb-4">
                    <div class="flex items-center gap-2 text-danger text-sm font-semibold mb-1"><i class="ph ph-battery-warning"></i> High Fatigue (7/10)</div>
                    <div class="flex items-center gap-2 text-warning text-sm font-semibold"><i class="ph ph-moon"></i> Poor Sleep (5.3h)</div>
                </div>
            </div>
            
            <div class="relative mt-4">
                <div style="position:absolute; left:-25px; top:0; width:16px; height:16px; border-radius:50%; background:var(--bg-dark); border:2px solid var(--surface-200);"></div>
                <div class="text-xs text-muted mb-1 font-bold">YESTERDAY</div>
                <div class="card p-3 mb-4">
                    <div class="flex items-center gap-2 text-primary text-sm font-semibold mb-1"><i class="ph ph-barbell"></i> Legs (40m)</div>
                    <div class="text-xs text-muted mt-1">Volume: 35 units</div>
                </div>
            </div>
            
            <div class="relative mt-4">
                <div style="position:absolute; left:-25px; top:0; width:16px; height:16px; border-radius:50%; background:var(--bg-dark); border:2px solid var(--surface-200);"></div>
                <div class="text-xs text-muted mb-1 font-bold">WEDNESDAY</div>
                <div class="card p-3 mb-4">
                    <div class="flex items-center gap-2 text-primary text-sm font-semibold mb-1"><i class="ph ph-barbell"></i> Pull (35m)</div>
                    <div class="text-xs text-muted mt-1">Volume: 30 units</div>
                </div>
            </div>
        </div>
    `;
    return container;
}

function renderInsights() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <h1 class="text-2xl font-bold mb-6">My Body, My Data</h1>
        <p class="text-sm text-muted mb-4">Advanced predictive analytics based on your history.</p>

        <!-- Plateau Detector -->
        <div class="card mb-4" style="border-left: 4px solid var(--danger);">
            <div class="flex items-center gap-2 mb-2">
                <i class="ph ph-trend-down text-danger text-xl"></i>
                <h3 class="font-bold text-lg">Plateau Detector</h3>
            </div>
            <p class="text-sm mb-3">For 5 weeks, your progress in <strong>Barbell Squat</strong> has been minimal.</p>
            <div class="bg-surface-200 p-2 rounded text-xs text-muted mb-2">Factor analysis:</div>
            <div class="flex gap-2 flex-wrap mb-2">
                <span class="badge badge-yellow">High fatigue</span>
                <span class="badge badge-green">Good volume</span>
                <span class="badge badge-blue">Poor sleep post-session</span>
            </div>
            <p class="text-xs text-muted">Explanation: Volume is adequate, but lack of sleep recovery on training days prevents nervous system adaptation.</p>
        </div>

        <!-- Diet & Performance Correlation -->
        <div class="card mb-4" style="border-left: 4px solid var(--success);">
            <div class="flex items-center gap-2 mb-2">
                <i class="ph-fill ph-apple-logo text-success text-xl"></i>
                <h3 class="font-bold text-lg">Diet & Performance Pattern</h3>
            </div>
            <p class="text-sm mb-3">Your progress in <strong>Bench Press & Pull exercises</strong> correlates strongly with your protein intake.</p>
            <div class="bg-surface-200 p-2 rounded text-xs text-muted mb-2">AI Factor Analysis:</div>
            <p class="text-xs text-muted mb-2">In the last 3 weeks, your daily protein intake increased by <strong>15% (averaging 180g)</strong>. During this exact period, your Bench Press volume and max load increased by <strong>8%</strong>.</p>
            <p class="text-xs text-muted"><em>Conclusion:</em> Sustaining high protein intake directly drives your hypertrophy block progress, while historical drops below 140g correlated with plateauing.</p>
        </div>

        <!-- Personal Training Load -->
        <div class="card mb-4" style="border-left: 4px solid var(--warning);">
            <div class="flex items-center gap-2 mb-2">
                <i class="ph ph-chart-bar text-warning text-xl"></i>
                <h3 class="font-bold text-lg">Personal Training Load</h3>
            </div>
            <div class="flex justify-between items-center mb-3">
                <div class="text-center">
                    <div class="text-2xl font-bold">110</div>
                    <div class="text-xs text-muted">Your Baseline</div>
                </div>
                <i class="ph ph-arrow-right text-muted text-xl"></i>
                <div class="text-center">
                    <div class="text-2xl font-bold text-warning">175</div>
                    <div class="text-xs text-muted">This Week</div>
                </div>
            </div>
            <p class="text-xs text-muted">Significantly above your historical range. Watch out for overtraining.</p>
        </div>

        <!-- Overload Balance -->
        <div class="card mb-4" style="border-left: 4px solid var(--accent-primary);">
            <div class="flex items-center gap-2 mb-2">
                <i class="ph ph-scales text-primary text-xl"></i>
                <h3 class="font-bold text-lg">Overload Balance</h3>
            </div>
            <div class="flex justify-between text-xs text-muted mb-2 text-center">
                <div style="flex:1">Volume<br><span class="text-success font-bold">OK</span></div>
                <div style="flex:1">Intensity<br><span class="text-danger font-bold">HIGH</span></div>
                <div style="flex:1">Recovery<br><span class="text-warning font-bold">LOW</span></div>
            </div>
            <p class="text-xs text-muted border-t pt-2" style="border-color: var(--border-color);">Too rapid increase in intensity with a drop in recovery compared to your history.</p>
        </div>

        <!-- Personal Digital Twin -->
        <div class="card glass" style="border-color: var(--accent-primary);">
            <div class="flex items-center gap-2 mb-2">
                <i class="ph ph-dna text-primary text-xl"></i>
                <h3 class="font-bold text-lg">Personal Digital Twin</h3>
            </div>
            <p class="text-sm italic">"How do I usually react to this workout?"</p>
            <div class="bg-surface-200 p-3 rounded mt-2 text-sm">
                After similar volume sessions (Leg Day), you typically need about <strong>48 h</strong> before returning to your typical performance. 
                Expect DOMS (delayed onset muscle soreness) around tomorrow evening.
            </div>
        </div>
    `;
    return container;
}

function renderTrain() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <h1 class="text-2xl font-bold mb-6">Your Workouts</h1>
        
        <!-- Gym-Aware Banner -->
        <div class="card p-3 mb-6" style="background: rgba(255,193,7,0.1); border-left: 4px solid var(--warning);">
            <div class="flex items-start gap-2">
                <i class="ph ph-warning-circle text-warning text-xl mt-1"></i>
                <div>
                    <div class="font-bold text-sm text-warning">Gym-Aware: Equipment Change (Club X)</div>
                    <div class="text-xs text-muted">Flat bench is currently unavailable. We automatically substituted the exercise in the "Chest & Back" module with the Smith machine press.</div>
                </div>
            </div>
        </div>

        <!-- AI Plan Generation -->
        <div class="card glass border-primary mb-6 p-4" style="border-color: var(--accent-primary);">
            <div class="flex items-center gap-2 text-primary font-bold mb-2">
                <i class="ph ph-sparkle text-xl"></i> Create plan with AI
            </div>
            <p class="text-xs text-muted mb-3">Describe your goal. We'll consider your recent results and available gym equipment.</p>
            <div class="flex flex-col gap-2">
                <textarea id="ai-plan-prompt" class="bg-surface-200 text-main border-none rounded p-3 w-full text-sm" style="background: var(--surface-200); color: white; border: 1px solid var(--border-color); resize: none; min-height: 80px;" placeholder="e.g. Create a workout for a beginner with bodybuilding goals..."></textarea>
                <div class="flex gap-2 flex-wrap" id="ai-tags-container">
                    <span class="badge badge-blue cursor-pointer ai-tag">#bodybuilding</span>
                    <span class="badge badge-blue cursor-pointer ai-tag">#power</span>
                    <span class="badge badge-blue cursor-pointer ai-tag">#beginner</span>
                    <span class="badge badge-blue cursor-pointer ai-tag">#home_workout</span>
                </div>
                <button id="btn-generate-plan" class="btn btn-primary mt-2 flex items-center justify-center gap-2"><i class="ph ph-magic-wand"></i> Generate Plan</button>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        let selectedTags = [];
        document.querySelectorAll('.ai-tag').forEach(tag => {
            tag.onclick = () => {
                const text = tag.innerText.replace('#', '');
                if (selectedTags.includes(text)) {
                    selectedTags = selectedTags.filter(t => t !== text);
                    tag.style.opacity = "1";
                } else {
                    selectedTags.push(text);
                    tag.style.opacity = "0.6";
                }
            };
        });

        const btn = document.getElementById('btn-generate-plan');
        if (btn) {
            btn.onclick = async () => {
                const prompt = document.getElementById('ai-plan-prompt').value;
                btn.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Generating...';
                
                const res = await fetch('/api/generate-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, tags: selectedTags })
                });
                
                const data = await res.json();
                if (data.status === 'success') {
                    WorkoutPlans.unshift(data.data);
                    window.navigate('train');
                }
            };
        }
    }, 0);
    
    container.innerHTML += `
        <h3 class="font-semibold text-lg mb-3">Your Modules</h3>
        
        ${WorkoutPlans.map(plan => `
            <div class="card mb-4 p-4">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-bold text-lg">${plan.name}</h3>
                        <p class="text-xs text-muted mb-3">${plan.description}</p>
                    </div>
                    <button class="btn btn-secondary text-xs" style="padding: 6px 12px;"><i class="ph ph-play"></i> Start</button>
                </div>
                
                <div class="border-t border-color pt-3 mt-3" style="border-top: 1px solid var(--border-color);">
                    <div class="text-xs font-bold uppercase text-muted mb-2">Exercises in module</div>
                    ${plan.exercises.map((ex, idx) => `
                        <div class="flex justify-between items-center mb-2 text-sm cursor-pointer" style="padding: 6px 8px; margin: 0 -8px; border-radius: 8px; transition: background 0.15s;" onmouseover="this.style.background='var(--surface-200)'" onmouseout="this.style.background='transparent'" onclick="window.goToKBDetail('${ex.name}')">
                            <span><span class="text-muted mr-1">${idx+1}.</span> ${ex.name} <i class="ph ph-arrow-right text-muted text-xs" style="margin-left:4px"></i></span>
                            <span class="badge bg-surface-200 text-xs">${ex.sets}x${ex.reps}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    `;
    return container;
}

function renderProfile() {
    const container = createEl('div', 'screen');
    
    // Make toggle function available globally for this render
    window.toggleRole = () => {
        appState.isTrainer = !appState.isTrainer;
        window.navigate('profile');
    };

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--surface-200); display: flex; align-items: center; justify-content: center; font-size: 24px;">
                    <i class="ph ph-user"></i>
                </div>
                <div>
                    <h1 class="text-xl font-bold">${UserProfile.name}</h1>
                    <div class="text-xs text-muted cursor-pointer hover:text-white transition-colors" onclick="window.toggleRole()" style="display: flex; align-items: center; gap: 4px; padding: 2px 4px; border-radius: 4px; background: rgba(255,255,255,0.1);">
                        <i class="ph ph-arrows-left-right"></i> ${appState.isTrainer ? '<strong class="text-primary">Trainer Account</strong>' : 'Standard User'}
                    </div>
                </div>
            </div>
            <button class="btn btn-outline" style="padding: 8px;" onclick="window.navigate('settings')"><i class="ph ph-gear"></i></button>
        </div>

        ${appState.isTrainer ? `
            <div class="card mb-6 p-4 border-l-4 border-primary" style="background: var(--surface-200); border-left-color: var(--accent-primary);">
                <div class="flex items-center gap-2 mb-2">
                    <i class="ph ph-users-three text-xl text-primary"></i>
                    <h3 class="font-bold text-lg">Trainer Dashboard</h3>
                </div>
                <p class="text-sm text-muted mb-4">Monitor your clients' progress, update their plans, and send messages.</p>
                <button class="btn btn-primary w-full font-bold" onclick="window.navigate('clients')">
                    Check your clients <i class="ph ph-arrow-right"></i>
                </button>
            </div>
        ` : ''}
        
        <div class="card border-primary mb-4 p-3 flex justify-between items-center cursor-pointer" style="border-color: var(--accent-primary);" onclick="window.navigate('insights')">
            <span class="font-bold"><i class="ph ph-sparkle text-primary"></i> AI Insight</span>
            <span class="text-xs">Weekly Averages ></span>
        </div>

        <div class="card mb-4 p-3">
            <h3 class="font-semibold text-sm mb-2">Habits & Sleep</h3>
            <div class="text-xs text-muted mb-2">Your sleep has shortened recently.</div>
            <button class="btn btn-outline text-xs w-full" style="padding: 6px;"><i class="ph ph-sparkle text-primary"></i> AI Recommendations</button>
        </div>
        
        <!-- Navigation Grid based on wireframe -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 24px;">
            <div class="card p-3 text-center cursor-pointer" onclick="window.navigate('history')">
                <i class="ph ph-barbell text-2xl mb-1 text-primary"></i>
                <div class="text-xs font-semibold">Workout History</div>
                <div class="text-xs text-muted mt-1">Statistics</div>
            </div>
            <div class="card p-3 text-center cursor-pointer" onclick="window.navigate('diet')">
                <i class="ph ph-apple-logo text-2xl mb-1 text-success"></i>
                <div class="text-xs font-semibold">Diet History</div>
                <div class="text-xs text-muted mt-1">Statistics</div>
            </div>
            <div class="card p-3 text-center">
                <i class="ph ph-heartbeat text-2xl mb-1 text-danger"></i>
                <div class="text-xs font-semibold">Heart Rate</div>
                <div class="text-xs text-muted mt-1">Other signals</div>
            </div>
        </div>

        <!-- Social / Pro Links -->
        <button class="btn btn-secondary w-full mb-3" style="justify-content: space-between; font-weight: bold;" onclick="window.navigate('find_trainer')">
            <span><i class="ph ph-chalkboard-teacher"></i> Find your Trainer</span>
            <i class="ph ph-caret-right"></i>
        </button>
        
        <button class="btn btn-outline w-full mb-3" style="justify-content: space-between; font-weight: bold; border-color: var(--warning); color: var(--warning);" onclick="window.navigate('symptom_tracker')">
            <span><i class="ph ph-bandaids"></i> Symptom Tracker & Health</span>
            <i class="ph ph-caret-right"></i>
        </button>
        
        <button class="btn btn-secondary w-full mb-6" style="justify-content: space-between; font-weight: bold;" onclick="window.navigate('community')">
            <span><i class="ph ph-users"></i> Find your Buddy & Community</span>
            <i class="ph ph-caret-right"></i>
        </button>
    `;
    return container;
}

function renderSettings() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('profile')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Settings</h1>
        </div>
        
        <h3 class="font-semibold text-lg mb-3">Connected Devices & Apps</h3>
        
        <!-- Apple Health / Google Fit -->
        <div class="card mb-3 p-3 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div style="background: rgba(255, 69, 58, 0.2); color: #ff453a; padding: 10px; border-radius: 8px;"><i class="ph-fill ph-heartbeat text-xl"></i></div>
                <div>
                    <div class="font-bold">Apple Health / Google Fit</div>
                    <div class="text-xs text-muted">Sync steps and basic vitals</div>
                </div>
            </div>
            <button class="btn btn-outline text-xs" style="padding: 4px 8px; border-color: var(--success); color: var(--success);" onclick="alert('Disconnected successfully')">Connected</button>
        </div>

        <!-- Smartwatch (Garmin/Whoop/etc) -->
        <div class="card mb-6 p-3 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div style="background: rgba(50, 173, 230, 0.2); color: #32ade6; padding: 10px; border-radius: 8px;"><i class="ph-fill ph-watch text-xl"></i></div>
                <div>
                    <div class="font-bold">Smartwatch / Tracker</div>
                    <div class="text-xs text-muted">Garmin, Oura, Whoop, Apple Watch</div>
                </div>
            </div>
            <button class="btn btn-primary text-xs" style="padding: 4px 8px;" onclick="alert('Searching for nearby Bluetooth devices...')">Connect</button>
        </div>

        <h3 class="font-semibold text-lg mb-3">General Settings</h3>

        <!-- Units -->
        <div class="card mb-3 p-3 flex justify-between items-center interactive" onclick="alert('Switched to lbs (Pounds)')">
            <div>
                <div class="font-bold">Weight Units</div>
                <div class="text-xs text-muted">Currently: Kilograms (kg)</div>
            </div>
            <i class="ph ph-arrows-left-right text-muted"></i>
        </div>

        <!-- Theme -->
        <div class="card mb-3 p-3 flex justify-between items-center interactive" onclick="alert('Light theme coming soon!')">
            <div>
                <div class="font-bold">Theme</div>
                <div class="text-xs text-muted">Currently: Dark Mode</div>
            </div>
            <i class="ph ph-moon text-muted"></i>
        </div>

        <!-- Notifications -->
        <div class="card mb-3 p-3 flex justify-between items-center interactive" onclick="alert('Notification settings updated')">
            <div>
                <div class="font-bold">Push Notifications</div>
                <div class="text-xs text-muted">Workout reminders, coach messages</div>
            </div>
            <div class="w-10 h-5 bg-primary rounded-full relative" style="background: var(--success);">
                <div class="w-4 h-4 bg-white rounded-full absolute" style="right: 2px; top: 2px;"></div>
            </div>
        </div>

        <div class="mt-8 text-center">
            <button class="btn w-full text-danger" style="background: rgba(255, 69, 58, 0.1); border: 1px solid rgba(255, 69, 58, 0.3);" onclick="alert('Logged out successfully.')"><i class="ph ph-sign-out"></i> Log Out</button>
        </div>
    `;
    return container;
}

function renderClients() {
    const container = createEl('div', 'screen');
    
    const clients = [
        {
            id: 'c1', name: 'Matthew Smith', 
            lastWorkout: 'Upper Body Power (Yesterday)', 
            loadChange: '+5%', fatigue: 6,
            dietStatus: 'On track (2750 kcal)',
            avatar: 'MS'
        },
        {
            id: 'c2', name: 'Anna Johnson', 
            lastWorkout: 'Leg Day (Today)', 
            loadChange: '-2%', fatigue: 8,
            dietStatus: 'Needs review',
            avatar: 'AJ'
        },
        {
            id: 'c3', name: 'Peter Williams', 
            lastWorkout: 'Rest Day', 
            loadChange: 'Stable', fatigue: 3,
            dietStatus: 'On track (3200 kcal)',
            avatar: 'PW'
        }
    ];

    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('profile')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">My Clients</h1>
        </div>

        <div class="mb-6 relative">
            <i class="ph ph-magnifying-glass absolute text-muted" style="left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px;"></i>
            <input type="text" placeholder="Search clients..." class="bg-surface-200 text-main border-none rounded p-2" style="width: 100%; padding-left: 36px; background: var(--surface-200); color: white; box-sizing: border-box;">
        </div>

        ${clients.map(c => `
            <div class="card mb-4 p-4">
                <div class="flex items-start gap-4 mb-3">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--surface-300); display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; border: 2px solid ${c.fatigue > 7 ? 'var(--danger)' : 'var(--accent-primary)'};">
                        ${c.avatar}
                    </div>
                    <div style="flex: 1;">
                        <h3 class="font-bold text-lg">${c.name}</h3>
                        
                        <div class="mt-2 text-xs text-muted mb-1 uppercase font-bold">Latest Training</div>
                        <div class="flex justify-between items-center text-sm">
                            <span>${c.lastWorkout}</span>
                            <span class="badge ${c.loadChange.includes('+') ? 'badge-green' : 'badge-yellow'}">${c.loadChange} Load</span>
                        </div>
                        
                        <div class="mt-2 text-xs text-muted mb-1 uppercase font-bold">Diet & Recovery</div>
                        <div class="flex justify-between items-center text-sm">
                            <span>${c.dietStatus}</span>
                            <span class="font-bold" style="color: ${c.fatigue > 7 ? 'var(--danger)' : 'var(--muted)'}">Fatigue: ${c.fatigue}/10</span>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-2 mt-3 pt-3" style="border-top: 1px dashed var(--border-color);">
                    <button class="btn btn-primary" style="flex: 1;"><i class="ph ph-chart-line-up"></i> Details</button>
                    <button class="btn btn-secondary" style="flex: 1;" onclick="alert('Message window to ${c.name} opened.')"><i class="ph ph-chat-circle"></i> Message</button>
                </div>
            </div>
        `).join('')}
    `;

    return container;
}

function renderKnowledgeBase() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <h1 class="text-2xl font-bold mb-2">Knowledge & Plans</h1>
        <p class="text-sm text-muted mb-6">Explore exercises, grab an expert plan, or learn the basics.</p>
        
        <div class="card mb-4 interactive border-primary p-4" onclick="window.navigate('knowledge_exercises')">
            <div class="flex items-center gap-4 mb-2">
                <div style="background: var(--surface-300); padding: 12px; border-radius: 12px;"><i class="ph-fill ph-barbell text-primary text-2xl"></i></div>
                <div>
                    <h3 class="font-bold text-lg">Exercise Database</h3>
                    <p class="text-xs text-muted">Search how to perform exercises properly</p>
                </div>
            </div>
        </div>

        <div class="card mb-4 interactive border-warning p-4" onclick="window.navigate('expert_plans')">
            <div class="flex items-center gap-4 mb-2">
                <div style="background: var(--surface-300); padding: 12px; border-radius: 12px;"><i class="ph-fill ph-clipboard-text text-warning text-2xl"></i></div>
                <div>
                    <h3 class="font-bold text-lg">Expert Workout Plans</h3>
                    <p class="text-xs text-muted">Ready-made templates for beginners</p>
                </div>
            </div>
        </div>

        <div class="card mb-4 interactive border-success p-4" onclick="window.navigate('knowledge_articles')">
            <div class="flex items-center gap-4 mb-2">
                <div style="background: var(--surface-300); padding: 12px; border-radius: 12px;"><i class="ph-fill ph-book-open text-success text-2xl"></i></div>
                <div>
                    <h3 class="font-bold text-lg">Knowledge Hub</h3>
                    <p class="text-xs text-muted">Basics of diet, exercise, and equipment</p>
                </div>
            </div>
        </div>
    `;
    return container;
}

function renderKnowledgeExercises() {
    const container = createEl('div', 'screen');
    const db = Object.keys(ExerciseDB).map(k => ({ id: k, ...ExerciseDB[k] }));
    
    // Extract unique muscle groups and tags
    const muscles = [...new Set(db.map(ex => ex.primary).filter(Boolean))].sort();
    const allTags = new Set();
    db.forEach(ex => {
        if(ex.tags) ex.tags.forEach(t => allTags.add(t));
    });
    const tags = [...allTags].sort();

    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('knowledge_base')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Exercise Database</h1>
        </div>
        
        <div class="mb-3 relative">
            <i class="ph ph-magnifying-glass absolute text-muted" style="left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px;"></i>
            <input type="text" id="kb-search" placeholder="Search exercise..." class="bg-surface-200 text-main border-none rounded p-2" style="width: 100%; padding-left: 36px; background: var(--surface-200); color: white; border: 1px solid var(--border-color); box-sizing: border-box;" onkeyup="window.applyKBFilters()">
        </div>

        <div class="mb-6 flex gap-2 overflow-x-auto pb-2" style="white-space: nowrap;">
            <select id="kb-filter-muscle" class="bg-surface-200 text-xs p-2 rounded border-none text-main" style="background: var(--surface-200); color: white; border: 1px solid var(--border-color);" onchange="window.applyKBFilters()">
                <option value="">All Muscles</option>
                ${muscles.map(m => `<option value="${m}">${m.charAt(0).toUpperCase() + m.slice(1)}</option>`).join('')}
            </select>
            <select id="kb-filter-tag" class="bg-surface-200 text-xs p-2 rounded border-none text-main" style="background: var(--surface-200); color: white; border: 1px solid var(--border-color);" onchange="window.applyKBFilters()">
                <option value="">All Tags / Equipment</option>
                ${tags.map(t => `<option value="${t}">#${t}</option>`).join('')}
            </select>
        </div>

        <div id="kb-list">
            ${db.map(ex => `
                <div class="card mb-3 kb-item p-3 cursor-pointer hover:bg-surface-300" data-name="${ex.name.toLowerCase()}" data-primary="${ex.primary || ''}" data-tags="${(ex.tags || []).join(',')}" onclick="appState.selectedKBItem = '${ex.id}'; window.navigate('knowledge_base_detail')">
                    <div class="flex justify-between items-center mb-1">
                        <h3 class="font-semibold text-lg">${ex.name}</h3>
                        <i class="ph ph-caret-right text-muted"></i>
                    </div>
                    <div class="flex gap-1 flex-wrap mt-2">
                        ${ex.primary ? `<span class="badge" style="background: rgba(74,222,128,0.2); color: #4ade80; border: 1px solid #4ade80; font-size: 10px;">${ex.primary.toUpperCase()}</span>` : ''}
                        ${ex.tags ? ex.tags.map(t => `<span class="badge badge-blue text-xs">#${t}</span>`).join('') : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    return container;
}

function renderExpertPlans() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('knowledge_base')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Expert Plans</h1>
        </div>
        <p class="text-sm text-muted mb-6">Start with a basic, ready-made plan created by professional trainers.</p>

        <div class="card mb-4 border-warning" style="border-color: var(--warning);">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-lg">Absolute Beginner Full Body</h3>
                    <p class="text-xs text-muted mb-2">Perfect for your first days at the gym. Focuses on machines and safe movements.</p>
                    <div class="flex gap-2">
                        <span class="badge badge-green">Beginner</span>
                        <span class="badge badge-blue">45 min</span>
                    </div>
                </div>
            </div>
            <button class="btn btn-warning w-full mt-3" style="background: var(--warning); color: #000; width: 100%;" onclick="alert('Plan added to your Train section!')"><i class="ph ph-download-simple"></i> Save to my plans</button>
        </div>

        <div class="card mb-4 border-warning" style="border-color: var(--warning);">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <h3 class="font-bold text-lg">Push / Pull / Legs Intro</h3>
                    <p class="text-xs text-muted mb-2">A solid foundation for building muscle safely over 3 days.</p>
                    <div class="flex gap-2">
                        <span class="badge badge-green">Beginner</span>
                        <span class="badge badge-blue">60 min</span>
                    </div>
                </div>
            </div>
            <button class="btn btn-warning w-full mt-3" style="background: var(--warning); color: #000; width: 100%;" onclick="alert('Plan added to your Train section!')"><i class="ph ph-download-simple"></i> Save to my plans</button>
        </div>
    `;
    return container;
}

function renderKnowledgeArticles() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('knowledge_base')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Knowledge Hub</h1>
        </div>
        
        <h3 class="font-semibold text-lg mb-3 mt-4">Diet & Nutrition</h3>
        <div class="card mb-4 p-3 flex justify-between items-center interactive border-l-2 border-primary" style="border-left: 3px solid var(--accent-primary);" onclick="alert('Opening article...')">
            <div><div class="font-bold">Basic Information About Diet</div><div class="text-xs text-muted">Macros, calories, and building a foundation.</div></div>
            <i class="ph ph-caret-right text-muted"></i>
        </div>

        <h3 class="font-semibold text-lg mb-3">Exercises</h3>
        <div class="card mb-4 p-3 flex justify-between items-center interactive border-l-2 border-primary" style="border-left: 3px solid var(--accent-secondary);" onclick="alert('Opening article...')">
            <div><div class="font-bold">Basic Information About Exercises</div><div class="text-xs text-muted">Form, tempo, and how muscles grow.</div></div>
            <i class="ph ph-caret-right text-muted"></i>
        </div>

        <h3 class="font-semibold text-lg mb-3">Equipment</h3>
        <div class="card mb-4 p-3 flex justify-between items-center interactive border-l-2 border-primary" style="border-left: 3px solid var(--warning);" onclick="alert('Opening article...')">
            <div><div class="font-bold">How to Use Gym Equipment</div><div class="text-xs text-muted">Machines vs Free Weights – safe usage guide.</div></div>
            <i class="ph ph-caret-right text-muted"></i>
        </div>
    `;
    return container;
}

function renderKnowledgeBaseDetail() {
    const container = createEl('div', 'screen');
    const ex = ExerciseDB[appState.selectedKBItem];
    
    if (!ex) return renderKnowledgeBase();

    // Find stats in WorkoutHistory or use realistic mock data for the specific exercise
    let histEx = null;
    WorkoutHistory.forEach(w => {
        const found = w.exercises.find(e => e.ref === appState.selectedKBItem || e.name.toLowerCase() === ex.name.toLowerCase());
        if (found) histEx = found;
    });

    if (!histEx) {
        // Fallback realistic mock stats if not in history
        histEx = {
            loadChart: [30, 32, 35, 34, 38],
            timeChart: [45, 42, 40, 40, 38],
            repsChart: [8, 10, 10, 12, 12],
            setsChart: [3, 3, 3, 4, 4]
        };
    } else {
        if (!histEx.setsChart) histEx.setsChart = [3, 3, 4, 4, 4];
    }

    const avgLoad = Math.round(histEx.loadChart.reduce((a,b) => a+b, 0) / histEx.loadChart.length);
    const avgTime = Math.round(histEx.timeChart.reduce((a,b) => a+b, 0) / histEx.timeChart.length);
    const avgReps = Math.round(histEx.repsChart.reduce((a,b) => a+b, 0) / histEx.repsChart.length);
    const avgSets = Math.round(histEx.setsChart.reduce((a,b) => a+b, 0) / histEx.setsChart.length);

    const makeSparkline = (data, unit = '') => {
        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        const min = minVal === maxVal ? minVal - 1 : minVal - (maxVal - minVal) * 0.1;
        const max = minVal === maxVal ? maxVal + 1 : maxVal + (maxVal - minVal) * 0.1;
        const width = 100;
        const height = 40;
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / (max - min)) * height;
            return `${x},${y}`;
        }).join(' ');

        let formatVal = (v) => v.toFixed(0) + unit;
        if (unit === 'min') {
            formatVal = (v) => Math.floor(v/60) + ':' + (Math.round(v)%60).toString().padStart(2, '0');
        }

        return `
        <div style="position: relative; width: 100%; height: 100%;">
            <div style="position: absolute; top: -5px; left: 0; width: 35px; font-size: 10px; color: var(--muted); text-align: right;">${formatVal(maxVal)}</div>
            <div style="position: absolute; bottom: -5px; left: 0; width: 35px; font-size: 10px; color: var(--muted); text-align: right;">${formatVal(minVal)}</div>
            <div style="margin-left: 45px; height: 100%; border-bottom: 1px dashed var(--border-color); position: relative;">
                <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;">
                    <polyline fill="none" stroke="var(--accent-primary)" stroke-width="2" points="${points}"/>
                </svg>
            </div>
        </div>`;
    };

    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('knowledge_exercises')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-xl font-bold">${ex.name}</h1>
        </div>

        <!-- Video Placeholder -->
        <div class="mb-4" style="width: 100%; height: 200px; background: var(--surface-200); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border-color);">
            <div class="text-center text-muted">
                <i class="ph ph-play-circle text-4xl mb-2"></i>
                <div class="text-xs">Instructional Video</div>
            </div>
        </div>
        
        <p class="text-sm text-muted mb-6">${ex.description || "No description available for this exercise."}</p>
        
        <div class="flex gap-2 mb-6">
            ${ex.tags ? ex.tags.map(t => `<span class="badge badge-blue">${t}</span>`).join('') : ''}
        </div>
        
        <button class="btn btn-outline w-full mb-6 border-warning text-warning font-bold flex items-center justify-center gap-2" style="border-color: var(--warning); color: var(--warning);" onclick="window.navigate('camera_feedback')">
            <i class="ph ph-camera text-lg"></i> Record -> Check technique with AI
        </button>

        <h3 class="font-bold text-lg mb-4 border-b pb-2" style="border-color: var(--border-color);">Your Statistics</h3>

        <div class="card glass mb-6 p-4">
            <h3 class="font-semibold mb-3 text-sm text-muted uppercase text-center">Averages (Last 30 days)</h3>
            <div class="flex justify-between text-center">
                <div>
                    <div class="font-bold text-lg text-primary">${avgLoad}</div>
                    <div class="text-xs text-muted">Load (kg)</div>
                </div>
                <div>
                    <div class="font-bold text-lg text-warning">${Math.floor(avgTime/60)}:${(avgTime%60).toString().padStart(2, '0')}</div>
                    <div class="text-xs text-muted">Time/Set</div>
                </div>
                <div>
                    <div class="font-bold text-lg text-success">${avgSets}</div>
                    <div class="text-xs text-muted">Sets</div>
                </div>
                <div>
                    <div class="font-bold text-lg text-success">${avgReps}</div>
                    <div class="text-xs text-muted">Reps</div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-sm text-muted">LOAD TREND</h3>
            </div>
            <div style="height: 60px; padding: 10px 0;">${makeSparkline(histEx.loadChart, 'kg')}</div>
        </div>

        <div class="card mb-4">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-sm text-muted">TIME TREND</h3>
            </div>
            <div style="height: 60px; padding: 10px 0;">${makeSparkline(histEx.timeChart, 'min')}</div>
        </div>
        
        <div class="card mb-4">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-sm text-muted">SETS TREND</h3>
            </div>
            <div style="height: 60px; padding: 10px 0;">${makeSparkline(histEx.setsChart, '')}</div>
        </div>

        <div class="card mb-6">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-sm text-muted">REPS TREND</h3>
            </div>
            <div style="height: 60px; padding: 10px 0;">${makeSparkline(histEx.repsChart, '')}</div>
        </div>
    `;
    return container;
}

function renderCameraFeedback() {
    const container = createEl('div', 'screen');
    container.style.padding = "0";
    
    container.innerHTML = `
        <div style="position: relative; width: 100%; height: 100vh; background: #000;">
            <!-- Simulated Camera View -->
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0.3;">
                <i class="ph ph-camera text-6xl"></i>
            </div>
            
            <!-- Safe Area Overlay -->
            <div style="position: absolute; inset: 40px 20px; border: 2px dashed rgba(255,255,255,0.2); border-radius: 12px;"></div>
            
            <!-- Top Controls -->
            <div style="position: absolute; top: 40px; left: 20px; right: 20px; display: flex; justify-content: space-between; align-items: center;">
                <button class="btn btn-secondary rounded-full" style="padding: 10px; border-radius: 50%;" onclick="window.navigate('train')"><i class="ph ph-x"></i></button>
                <div class="badge badge-primary bg-primary text-dark" style="background:var(--accent-primary);color:#000;">AI Analysis Active</div>
            </div>
            
            <!-- AI Feedback Drawer at bottom -->
            <div style="position: absolute; bottom: 80px; left: 0; width: 100%; padding: 20px; box-sizing: border-box;">
                <div class="card glass border-primary" style="border-color: var(--warning); box-shadow: 0 0 20px rgba(245, 158, 11, 0.2); width: 100%;">
                    <div class="flex items-center gap-3 mb-2 text-warning">
                        <i class="ph ph-warning-circle text-2xl"></i>
                        <h3 class="font-bold">Pay attention to...</h3>
                    </div>
                    <p class="text-sm">In the second part of the movement, your knee changes its path compared to previous repetitions. Try to maintain knee stability by pushing them outwards.</p>
                </div>
            </div>
        </div>
    `;
    return container;
}

function renderHistory() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('profile')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Workout History</h1>
        </div>
        
        ${WorkoutHistory.map(w => `
            <div class="card mb-6">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-bold text-lg">${w.date} - ${w.title}</h3>
                </div>
                
                <div class="card glass border-primary mb-4 p-3" style="border-color: var(--accent-primary);">
                    <div class="flex items-center gap-2 text-primary font-bold mb-1">
                        <i class="ph ph-sparkle"></i> AI Insight
                    </div>
                    <div class="text-sm">${w.aiInsight}</div>
                </div>

                <div class="text-xs text-muted mb-2 uppercase font-bold">Exercises</div>
                ${w.exercises.map(ex => `
                    <div class="card bg-surface-200 mb-2 p-3 flex justify-between items-center cursor-pointer" onclick="appState.selectedExercise = '${ex.id}'; window.navigate('exercise_stats')">
                        <span class="font-semibold">${ex.name}</span>
                        <i class="ph ph-caret-right text-muted"></i>
                    </div>
                `).join('')}
            </div>
        `).join('')}
    `;
    return container;
}

function renderExerciseStats() {
    const container = createEl('div', 'screen');
    const workout = WorkoutHistory[0];
    const exercise = workout.exercises.find(e => e.id === appState.selectedExercise) || workout.exercises[1];
    
    // Calculate simple averages for the mock stats
    const avgLoad = Math.round(exercise.loadChart.reduce((a,b) => a+b, 0) / exercise.loadChart.length);
    const avgTime = Math.round(exercise.timeChart.reduce((a,b) => a+b, 0) / exercise.timeChart.length);
    const avgReps = Math.round(exercise.repsChart.reduce((a,b) => a+b, 0) / exercise.repsChart.length);
    
    // Add fallback for sets
    const setsChart = exercise.setsChart || [3, 3, 4, 4, 4];
    const avgSets = Math.round(setsChart.reduce((a,b) => a+b, 0) / setsChart.length);

    // Helper to generate a simple SVG sparkline path
    const makeSparkline = (data, unit = '') => {
        const minVal = Math.min(...data);
        const maxVal = Math.max(...data);
        const min = minVal === maxVal ? minVal - 1 : minVal - (maxVal - minVal) * 0.1;
        const max = minVal === maxVal ? maxVal + 1 : maxVal + (maxVal - minVal) * 0.1;
        const width = 100;
        const height = 40;
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((val - min) / (max - min)) * height;
            return `${x},${y}`;
        }).join(' ');

        let formatVal = (v) => v.toFixed(0) + unit;
        if (unit === 'min') {
            formatVal = (v) => Math.floor(v/60) + ':' + (Math.round(v)%60).toString().padStart(2, '0');
        }

        return `
        <div style="position: relative; width: 100%; height: 100%;">
            <div style="position: absolute; top: -5px; left: 0; width: 35px; font-size: 10px; color: var(--muted); text-align: right;">${formatVal(maxVal)}</div>
            <div style="position: absolute; bottom: -5px; left: 0; width: 35px; font-size: 10px; color: var(--muted); text-align: right;">${formatVal(minVal)}</div>
            <div style="margin-left: 45px; height: 100%; border-bottom: 1px dashed var(--border-color); position: relative;">
                <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;">
                    <polyline fill="none" stroke="var(--accent-primary)" stroke-width="2" points="${points}"/>
                </svg>
            </div>
        </div>`;
    };

    container.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-3">
                <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('history')"><i class="ph ph-arrow-left"></i></button>
                <h1 class="text-xl font-bold">${exercise.name}</h1>
            </div>
            <button class="btn btn-outline text-xs" style="padding: 4px 8px;" onclick="window.navigate('knowledge_base')">Info <i class="ph ph-info"></i></button>
        </div>

        <div class="card glass mb-6 p-4">
            <h3 class="font-semibold mb-3 text-sm text-muted uppercase text-center">Average Stats (Last 30 days)</h3>
            <div class="flex justify-between text-center">
                <div>
                    <div class="font-bold text-lg text-primary">${avgLoad}</div>
                    <div class="text-xs text-muted">Load (kg)</div>
                </div>
                <div>
                    <div class="font-bold text-lg text-warning">${Math.floor(avgTime/60)}:${(avgTime%60).toString().padStart(2, '0')}</div>
                    <div class="text-xs text-muted">Time/Set</div>
                </div>
                <div>
                    <div class="font-bold text-lg text-success">${avgSets}</div>
                    <div class="text-xs text-muted">Sets</div>
                </div>
                <div>
                    <div class="font-bold text-lg text-success">${avgReps}</div>
                    <div class="text-xs text-muted">Reps</div>
                </div>
            </div>
        </div>

        <div class="card mb-4">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-sm text-muted">LOAD TREND</h3>
            </div>
            <div style="height: 60px; padding: 10px 0;">${makeSparkline(exercise.loadChart, 'kg')}</div>
        </div>

        <div class="card mb-4">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-sm text-muted">TIME TREND</h3>
            </div>
            <div style="height: 60px; padding: 10px 0;">${makeSparkline(exercise.timeChart, 'min')}</div>
        </div>
        
        <div class="card mb-4">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-sm text-muted">SETS TREND</h3>
            </div>
            <div style="height: 60px; padding: 10px 0;">${makeSparkline(setsChart, '')}</div>
        </div>

        <div class="card mb-6">
            <div class="flex justify-between items-center mb-2">
                <h3 class="font-semibold text-sm text-muted">REPS TREND</h3>
            </div>
            <div style="height: 60px; padding: 10px 0;">${makeSparkline(exercise.repsChart, '')}</div>
        </div>

        <div class="flex gap-2">
            <button class="btn btn-outline" style="flex: 1;" onclick="window.navigate('camera_feedback')"><i class="ph ph-camera"></i> Check Technique</button>
            <button class="btn btn-secondary" style="flex: 1;"><i class="ph ph-sparkle text-primary"></i> AI Recommendations</button>
        </div>
    `;
    return container;
}

function renderDiet() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('profile')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Diet Entries</h1>
            <button class="btn btn-outline ml-auto" style="padding: 6px;"><i class="ph ph-plus"></i></button>
        </div>

        <div class="card glass border-primary mb-6 p-3" style="border-color: var(--accent-primary);">
            <div class="flex items-center gap-2 text-primary font-bold mb-1">
                <i class="ph ph-sparkle"></i> AI Recommendation
            </div>
            <div class="text-sm">${DietData.aiRecommendation}</div>
        </div>

        <div class="card mb-6">
            <h3 class="font-semibold mb-4 text-center">Macros Today</h3>
            <div class="flex justify-between text-center">
                <div>
                    <div class="font-bold text-lg text-primary">${DietData.macros.protein}%</div>
                    <div class="text-xs text-muted">Protein</div>
                </div>
                <div>
                    <div class="font-bold text-lg text-warning">${DietData.macros.fat}%</div>
                    <div class="text-xs text-muted">Fat</div>
                </div>
                <div>
                    <div class="font-bold text-lg text-success">${DietData.macros.carbs}%</div>
                    <div class="text-xs text-muted">Carbs</div>
                </div>
            </div>
        </div>

        <h3 class="font-semibold mb-3 text-sm text-muted uppercase">Today's Entries</h3>
        ${DietData.entries.map(e => `
            <div class="card p-3 mb-2 flex justify-between items-center">
                <div>
                    <div class="font-bold">${e.name}</div>
                    <div class="text-xs text-muted"><i class="ph ph-clock"></i> ${e.time}</div>
                </div>
                <div class="badge badge-blue">${e.kcal} kcal</div>
            </div>
        `).join('')}
    `;
    return container;
}

function renderFindTrainer() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('profile')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Find your Trainer</h1>
        </div>
        
        <p class="text-sm text-muted mb-4">Trainers matching your profile (Strength, Hypertrophy).</p>
        
        ${AvailableTrainers.map(t => `
            <div class="card mb-3 p-4">
                <div class="flex items-start gap-4 mb-3">
                    <div style="width: 50px; height: 50px; border-radius: 50%; background: var(--surface-200); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="ph ph-user text-2xl"></i>
                    </div>
                    <div style="flex: 1;">
                        <div class="flex justify-between items-start">
                            <div class="font-bold text-lg">${t.name}</div>
                            <div class="badge badge-green">${t.match} match</div>
                        </div>
                        <div class="text-xs font-bold text-primary mb-1">${t.specialty}</div>
                        <div class="text-xs text-muted">${t.desc}</div>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button class="btn btn-secondary" style="flex: 1;"><i class="ph ph-user-plus"></i> Hire</button>
                    <button class="btn btn-outline" style="flex: 1;"><i class="ph ph-chat-circle"></i> Message</button>
                </div>
            </div>
        `).join('')}
    `;
    return container;
}



function renderSymptomTracker() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('profile')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Symptom Tracker</h1>
        </div>
        
        <div class="card p-4 mb-4" style="border-left: 4px solid var(--warning);">
            <div class="flex gap-3 mb-2">
                <i class="ph ph-robot text-warning text-2xl"></i>
                <div>
                    <div class="font-bold text-sm">GymBud AI Analysis</div>
                    <div class="text-xs text-muted">In the last 3 weeks, left shoulder discomfort appeared during 6 out of 8 workouts containing pressing exercises.</div>
                </div>
            </div>
        </div>

        <div class="card mb-6 p-4">
            <h3 class="font-bold text-lg mb-3">Report new discomfort</h3>
            <div class="mb-3">
                <label class="text-xs text-muted block mb-1">Where does it occur?</label>
                <select id="sym-location" class="bg-surface-200 text-main border-none rounded p-2 w-full">
                    <option>Left shoulder</option>
                    <option>Right elbow</option>
                    <option>Lower back</option>
                    <option>Right knee</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="text-xs text-muted block mb-1">When does it appear?</label>
                <div class="flex gap-2" id="sym-timing-container">
                    <button class="btn btn-secondary text-xs sym-timing" data-val="Before workout" style="flex:1">Before workout</button>
                    <button class="btn btn-primary text-xs text-dark sym-timing" data-val="During" style="flex:1">During</button>
                    <button class="btn btn-secondary text-xs sym-timing" data-val="After workout" style="flex:1">After workout</button>
                </div>
            </div>
            <div class="mb-3">
                <label class="text-xs text-muted block mb-1">Intensity (1-10)</label>
                <input id="sym-intensity" type="range" min="1" max="10" value="4" class="w-full">
            </div>
            <button id="btn-add-symptom" class="btn btn-primary w-full"><i class="ph ph-plus"></i> Add entry</button>
        </div>
    `;

    setTimeout(() => {
        let timing = "During";
        document.querySelectorAll('.sym-timing').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.sym-timing').forEach(b => {
                    b.classList.remove('btn-primary', 'text-dark');
                    b.classList.add('btn-secondary');
                });
                btn.classList.remove('btn-secondary');
                btn.classList.add('btn-primary', 'text-dark');
                timing = btn.getAttribute('data-val');
            };
        });

        const btnAdd = document.getElementById('btn-add-symptom');
        if (btnAdd) {
            btnAdd.onclick = async () => {
                const location = document.getElementById('sym-location').value;
                const intensity = parseInt(document.getElementById('sym-intensity').value);
                
                btnAdd.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Saving...';
                
                await fetch('/api/symptoms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ location, timing, intensity })
                });
                
                btnAdd.innerHTML = '<i class="ph ph-check" style="color: var(--success)"></i> Added';
                setTimeout(() => {
                    window.navigate('symptom_tracker');
                }, 1000);
            };
        }
    }, 0);
    
    container.innerHTML += `
        
        <button class="btn btn-outline w-full mb-3 font-bold" onclick="window.navigate('doctor_report')">
            <i class="ph ph-stethoscope"></i> Generate report for doctor (Doctor Mode)
        </button>
    `;
    return container;
}

function renderDoctorReport() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('symptom_tracker')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-xl font-bold">GymBud Health Report</h1>
        </div>
        <div id="doctor-report-content" class="text-center p-5"><i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite; font-size: 24px;"></i> Loading...</div>
    `;

    setTimeout(async () => {
        try {
            const res = await fetch('/api/doctor-report');
            const data = await res.json();
            
            const content = document.getElementById('doctor-report-content');
            if (content) {
                content.className = "card bg-white text-black p-5";
                content.style.borderRadius = "8px";
                content.style.textAlign = "left";
                content.innerHTML = `
                    <div class="text-center mb-6 border-b pb-4" style="border-bottom: 1px solid #ccc;">
                        <h2 class="text-2xl font-black mb-1" style="color: black;">HEALTH REPORT</h2>
                        <div class="text-sm" style="color: #666;">Period: Last 4 weeks</div>
                    </div>
                    
                    <div class="mb-5">
                        <h3 class="font-bold text-lg mb-2" style="border-bottom: 1px solid #eee; color: black;">Activity and Load</h3>
                        <ul class="text-sm list-disc pl-4 space-y-1" style="color: black; margin-left: 16px;">
                            <li>Total workouts: ${data.stats.totalWorkouts}</li>
                            <li>Average duration: ${data.stats.avgDuration} min</li>
                            <li>Recent load changes: ${data.stats.recentLoadChange}</li>
                        </ul>
                    </div>

                    <div class="mb-5">
                        <h3 class="font-bold text-lg mb-2" style="border-bottom: 1px solid #eee; color: black;">Reported Discomfort</h3>
                        <ul class="text-sm list-disc pl-4 space-y-1" style="color: black; margin-left: 16px;">
                            ${data.symptoms.map(s => `
                            <li><span class="font-bold" style="color: #dc2626;">${s.location}:</span> Intensity (${s.intensity}/10).</li>
                            <li style="margin-bottom: 8px;">Timing: ${s.timing}. Date: ${new Date(s.date).toLocaleDateString()}</li>
                            `).join('')}
                            ${data.symptoms.length === 0 ? '<li>No recent symptoms reported.</li>' : ''}
                        </ul>
                    </div>
                    
                    <div class="mb-5">
                        <h3 class="font-bold text-lg mb-2" style="border-bottom: 1px solid #eee; color: black;">Recovery and Sleep</h3>
                        <ul class="text-sm list-disc pl-4 space-y-1" style="color: black; margin-left: 16px;">
                            <li>Average sleep: ${data.recovery.avgSleep}</li>
                            <li>Reported wellbeing: ${data.recovery.wellbeing}</li>
                        </ul>
                    </div>

                    <div class="mb-5">
                        <h3 class="font-bold text-lg mb-2" style="border-bottom: 1px solid #eee; color: black;">Nutrition and Macros</h3>
                        <ul class="text-sm list-disc pl-4 space-y-1" style="color: black; margin-left: 16px;">
                            <li>Average Intake: ${data.diet ? data.diet.avgKcal : 'N/A'} kcal</li>
                            <li>Macros: ${data.diet ? data.diet.macros : 'N/A'}</li>
                            <li>Note: ${data.diet ? data.diet.note : ''}</li>
                        </ul>
                    </div>
                    
                    <div class="text-center mt-6">
                        <button class="btn" style="background: black; color: white; padding: 8px 16px; border-radius: 4px; font-size: 14px;"><i class="ph ph-download-simple"></i> Download as PDF</button>
                    </div>
                `;
            }
        } catch (e) {
            console.error(e);
        }
    }, 0);

    return container;
}

function renderCommunity() {
    const container = createEl('div', 'screen');
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-6">
            <button class="btn btn-outline" style="padding: 6px;" onclick="window.navigate('profile')"><i class="ph ph-arrow-left"></i></button>
            <h1 class="text-2xl font-bold">Community</h1>
        </div>

        <h3 class="font-semibold mb-3">Communities you may like</h3>
        <div class="card mb-6">
            <div class="flex items-center gap-3 border-b border-color pb-3 mb-3" style="border-bottom: 1px solid var(--border-color);">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--surface-200); display: flex; align-items: center; justify-content: center;"><i class="ph ph-barbell"></i></div>
                <div>
                    <div class="font-bold">Powerlifting Warsaw</div>
                    <div class="text-xs text-muted">1.2k members</div>
                </div>
            </div>
            <div class="flex items-center gap-3 border-b border-color pb-3 mb-3" style="border-bottom: 1px solid var(--border-color);">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: var(--surface-200); display: flex; align-items: center; justify-content: center;"><i class="ph ph-person-simple-run"></i></div>
                <div>
                    <div class="font-bold">Morning Cardio</div>
                    <div class="text-xs text-muted">340 members</div>
                </div>
            </div>
            <button class="btn btn-outline w-full text-xs" style="padding: 6px;">Show more</button>
        </div>

        <h3 class="font-semibold mb-3">Looking for buddies like you</h3>
        <p class="text-sm text-muted mb-4 border-l-2 border-primary pl-2" style="border-left: 2px solid var(--accent-primary); padding-left: 8px;">
            3 people in your club train with a similar scheme on Wednesdays 18:00–20:00.
        </p>
        ${ProfileData.buddies.map(b => `
            <div class="card mb-3 p-3 flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--surface-200); display: flex; align-items: center; justify-content: center;">
                        <i class="ph ph-user"></i>
                    </div>
                    <div>
                        <div class="font-bold">${b.name}</div>
                        <div class="text-xs text-muted">Match: <span class="text-success font-bold">${b.match}</span></div>
                    </div>
                </div>
                <button class="btn btn-secondary" style="padding: 6px 12px;">Message</button>
            </div>
        `).join('')}
    `;
    return container;
}

function renderBottomNav() {
    const nav = createEl('nav', 'bottom-nav');
    nav.innerHTML = `
        <button class="nav-item ${currentRoute === 'home' ? 'active' : ''}" onclick="window.navigate('home')">
            <i class="${currentRoute === 'home' ? 'ph-fill ph-house' : 'ph ph-house'}"></i>
            Home
        </button>
        <button class="nav-item ${currentRoute === 'knowledge_base' ? 'active' : ''}" onclick="window.navigate('knowledge_base')">
            <i class="${currentRoute === 'knowledge_base' ? 'ph-fill ph-book-open' : 'ph ph-book-open'}"></i>
            Knowledge
        </button>
        <button class="nav-item ${currentRoute === 'train' || currentRoute === 'camera_feedback' ? 'active' : ''}" onclick="window.navigate('train')">
            <i class="${currentRoute === 'train' || currentRoute === 'camera_feedback' ? 'ph-fill ph-barbell' : 'ph ph-barbell'}"></i>
            Train
        </button>
        <button class="nav-item ${currentRoute === 'profile' ? 'active' : ''}" onclick="window.navigate('profile')">
            <i class="${currentRoute === 'profile' ? 'ph-fill ph-user' : 'ph ph-user'}"></i>
            Profile
        </button>
    `;
    return nav;
}

// Attach to window for inline onclick handlers
window.navigate = navigate;
window.appState = appState;
window.startWorkout = () => navigate('train');
window.applyKBFilters = () => {
    const searchEl = document.getElementById('kb-search');
    const query = searchEl ? searchEl.value.toLowerCase() : '';
    
    const muscleEl = document.getElementById('kb-filter-muscle');
    const muscle = muscleEl ? muscleEl.value : '';
    
    const tagEl = document.getElementById('kb-filter-tag');
    const tag = tagEl ? tagEl.value : '';
    
    const items = document.querySelectorAll('.kb-item');
    items.forEach(item => {
        const nameMatch = item.dataset.name.includes(query);
        const muscleMatch = muscle === "" || item.dataset.primary === muscle;
        const tagMatch = tag === "" || item.dataset.tags.split(',').includes(tag);
        
        if (nameMatch && muscleMatch && tagMatch) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
};

// Helper: find ExerciseDB key by exercise name
window.findExIdByName = (name) => {
    const n = name.toLowerCase();
    for (const [id, ex] of Object.entries(ExerciseDB)) {
        if (ex.name.toLowerCase() === n) return id;
    }
    return null;
};

// Navigate to KB detail by exercise name (used from Train modules)
window.goToKBDetail = (name) => {
    const id = window.findExIdByName(name);
    if (id) {
        appState.selectedKBItem = id;
        navigate('knowledge_base_detail');
    } else {
        navigate('knowledge_base');
    }
};

// Event delegation for drawers
document.addEventListener('click', (e) => {
    if (e.target.closest('#toggle-why')) {
        const drawer = document.getElementById('why-drawer');
        if (drawer) drawer.classList.toggle('open');
    }
});

// Initial render after loading data
async function startApp() {
    await initData();
    render();
}
startApp();
