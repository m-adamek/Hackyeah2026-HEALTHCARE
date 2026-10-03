import { History, TodayPlan, UserProfile } from './mockData.js';

// --- Analytical Layer ---

export function getTodayContext() {
    // Get the most recent wellbeing entry
    return History.wellbeing[History.wellbeing.length - 1];
}

export function analyzePatterns() {
    // Detects pattern: Shorter sessions -> better adherence
    // Detects pattern: Higher volume -> higher fatigue
    
    return [
        {
            id: 'p1',
            title: "Shorter workouts appear easier for you to complete consistently.",
            evidence: {
                lt60_completed: 3,
                lt60_planned: 3,
                gte60_completed: 6,
                gte60_planned: 8 // Missed 2 long sessions in W2, W3
            },
            period: "28 days",
            confidence: "Medium",
            interpretation: "A shorter default workout may fit your current routine better.",
            limitations: "Observational data; schedule and motivation may also affect adherence."
        },
        {
            id: 'p2',
            title: "Higher-volume sessions are followed by higher fatigue.",
            evidence: {
                text: "In the last 14 days, your 3 highest-volume sessions were followed by fatigue ratings of 8 or 9 out of 10."
            },
            period: "14 days",
            confidence: "High",
            interpretation: "Your body needs more time to recover from extended volume. Consider capping sessions at 45 minutes.",
            limitations: "Observational data."
        }
    ];
}

export function getRecommendation() {
    const today = getTodayContext();
    const planned = TodayPlan;
    
    // Logic: If fatigue > 6 and sleep < 6, adapt to a reduced workout.
    if (today.fatigue >= 7 && today.sleep < 6) {
        return {
            type: "ADAPTATION",
            title: "Reduced-volume session",
            action: {
                type: "START_WORKOUT_VARIANT",
                variant_id: "leg_day_reduced_35m",
                duration: 35,
                exercises: [
                    { id: "ex1", name: "Barbell Squat", sets: 3, reps: 8 }, // Reduced sets
                    { id: "ex2", name: "Romanian Deadlift", sets: 2, reps: 10 }, // Reduced sets
                    // Removed leg press and calves to save time
                ]
            },
            rationale: [
                { factor: "Fatigue", value: `${today.fatigue}/10`, effect: "high", text: "High reported fatigue." },
                { factor: "Sleep", value: `${today.sleep}h`, effect: "low", text: "Sleep below your recent average." },
                { factor: "Recent Load", value: "High", effect: "high", text: "Above your typical range." }
            ],
            confidence: "Medium",
            safetyLevel: "green"
        };
    }
    
    return {
        type: "PROCEED",
        title: "Proceed with planned session",
        action: null,
        rationale: [],
        confidence: "High",
        safetyLevel: "green"
    };
}
