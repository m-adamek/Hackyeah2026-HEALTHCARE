// GymBud Mock Data Store

// User Profile
export const UserProfile = {
    id: "user_1",
    name: "Alex",
    goals: ["Build strength", "Maintain consistency"],
    preferences: {
        preferredDuration: 45, // minutes
    },
    baseline: {
        weeklyLoad: 110
    }
};

// Past 28 Days Demo Data (Synthetic)
// Shows pattern: high volume -> high fatigue
// Shows pattern: shorter sessions -> better adherence
export const History = {
    workouts: [
        // Week 1 (Good adherence, moderate load)
        { id: "w1", date: "2026-09-07", duration: 45, type: "Push", completed: true, load: 35 },
        { id: "w2", date: "2026-09-09", duration: 40, type: "Pull", completed: true, load: 30 },
        { id: "w3", date: "2026-09-11", duration: 45, type: "Legs", completed: true, load: 40 },

        // Week 2 (Higher volume, fatigue increases)
        { id: "w4", date: "2026-09-14", duration: 60, type: "Push", completed: true, load: 50 },
        { id: "w5", date: "2026-09-15", duration: 60, type: "Pull", completed: true, load: 50 },
        { id: "w6", date: "2026-09-17", duration: 60, type: "Legs", completed: true, load: 55 },
        { id: "w7", date: "2026-09-19", duration: 45, type: "Full Body", completed: false, load: 40 }, // Missed long session

        // Week 3 (Highest volume, high fatigue entries)
        { id: "w8", date: "2026-09-21", duration: 65, type: "Push", completed: true, load: 60 },
        { id: "w9", date: "2026-09-22", duration: 60, type: "Pull", completed: true, load: 55 },
        { id: "w10", date: "2026-09-24", duration: 65, type: "Legs", completed: true, load: 65 },
        { id: "w11", date: "2026-09-26", duration: 60, type: "Full Body", completed: false, load: 50 }, // Missed long session

        // Week 4 (Shorter sessions, better adherence)
        { id: "w12", date: "2026-09-28", duration: 35, type: "Push", completed: true, load: 30 },
        { id: "w13", date: "2026-09-30", duration: 35, type: "Pull", completed: true, load: 30 },
        { id: "w14", date: "2026-10-02", duration: 40, type: "Legs", completed: true, load: 35 },
    ],
    wellbeing: [
        // W1
        { date: "2026-09-08", sleep: 7.5, fatigue: 4, energy: 7 },
        { date: "2026-09-10", sleep: 7.0, fatigue: 3, energy: 8 },
        { date: "2026-09-12", sleep: 8.0, fatigue: 4, energy: 7 },
        // W2
        { date: "2026-09-15", sleep: 6.5, fatigue: 6, energy: 6 },
        { date: "2026-09-16", sleep: 6.0, fatigue: 7, energy: 5 },
        { date: "2026-09-18", sleep: 7.0, fatigue: 8, energy: 5 },
        // W3
        { date: "2026-09-22", sleep: 5.5, fatigue: 8, energy: 4 }, // High fatigue after heavy W3 start
        { date: "2026-09-23", sleep: 6.0, fatigue: 9, energy: 3 },
        { date: "2026-09-25", sleep: 6.5, fatigue: 8, energy: 4 },
        // W4
        { date: "2026-09-29", sleep: 7.5, fatigue: 5, energy: 7 },
        { date: "2026-10-01", sleep: 7.0, fatigue: 4, energy: 8 },
        { date: "2026-10-03", sleep: 5.3, fatigue: 7, energy: 5 }, // Today's context (low sleep, high fatigue)
    ]
};

// Planned Workout for Today
export const TodayPlan = {
    id: "plan_today",
    title: "Leg Day",
    duration: 60, // minutes
    loadEstimate: 55,
    exercises: [
        { id: "ex1", name: "Barbell Squat", sets: 4, reps: 8 },
        { id: "ex2", name: "Romanian Deadlift", sets: 3, reps: 10 },
        { id: "ex3", name: "Leg Press", sets: 3, reps: 12 },
        { id: "ex4", name: "Calf Raises", sets: 4, reps: 15 }
    ]
};

// Exercise Database (Exercise DNA & Knowledge Base)
export const ExerciseDB = {
    "ex1": { 
        name: "Barbell Squat", 
        primary: "quads", 
        pattern: "squat",
        tags: ["powerlifting", "bodybuilding"],
        description: "A compound multi-joint exercise engaging the lower body, with a barbell on the back.",
        videoPlaceholder: "squat-placeholder.jpg",
        lastStats: { weight: 80, reps: 8, date: "2026-10-02" }
    },
    "ex2": { name: "Romanian Deadlift", primary: "hamstrings", pattern: "hinge", tags: ["bodybuilding", "powerlifting"], description: "Stiff-legged deadlift focusing on the posterior chain.", videoPlaceholder: "rdl-placeholder.jpg", lastStats: { weight: 90, reps: 10, date: "2026-09-30" } },
    "ex3": { name: "Leg Press", primary: "quads", pattern: "squat", tags: ["bodybuilding"], substitutions: ["ex1", "ex5"], description: "Machine-based leg press.", videoPlaceholder: "legpress.jpg" },
    "ex4": { name: "Calf Raises", primary: "calves", pattern: "isolation", tags: ["bodybuilding"], description: "Standing calf raises.", videoPlaceholder: "calves.jpg" },
    "ex5": { name: "Bulgarian Split Squat", primary: "quads", pattern: "squat", tags: ["bodybuilding", "functional"], description: "Single-leg Bulgarian split squat.", videoPlaceholder: "bulgarian.jpg" },
    "ex6": { 
        name: "Dumbbell Goblet Squat", 
        primary: "quads", 
        pattern: "squat",
        tags: ["functional", "warmup"],
        description: "Squat with a dumbbell held with both hands at chest level. Excellent primer for barbell squats.",
        videoPlaceholder: "goblet-placeholder.jpg",
        lastStats: { weight: 24, reps: 12, date: "2026-09-24" }
    },
    "ex7": { 
        name: "Dumbbell Bench Press", 
        primary: "chest", 
        pattern: "horizontal push",
        tags: ["bodybuilding"],
        description: "Bench press with dumbbells on a flat bench. Allows for a greater range of motion than a barbell.",
        videoPlaceholder: "db-bench-placeholder.jpg",
        lastStats: { weight: 30, reps: 8, date: "2026-09-28" }
    },
    "ex8": { 
        name: "Dumbbell Row", 
        primary: "back", 
        pattern: "horizontal pull",
        tags: ["bodybuilding", "powerlifting"],
        description: "Single-arm dumbbell row supported on a bench. Isolates one side of the back.",
        videoPlaceholder: "db-row-placeholder.jpg",
        lastStats: { weight: 32, reps: 10, date: "2026-09-30" }
    },
    "ex9": {
        name: "Kettlebell Swing",
        primary: "hamstrings",
        pattern: "hinge",
        tags: ["crossfit", "functional"],
        description: "Kettlebell swing, excellent exercise for hip dynamics.",
        videoPlaceholder: "kb-swing.jpg"
    },
    "ex10": {
        name: "Downward Dog",
        primary: "full body",
        pattern: "stretch",
        tags: ["yoga", "warmup"],
        description: "Classic yoga pose stretching the posterior chain.",
        videoPlaceholder: "down-dog.jpg"
    },
    "ex11": {
        name: "Box Jumps",
        primary: "legs",
        pattern: "plyometric",
        tags: ["crossfit", "power"],
        description: "Box jumps building explosive power.",
        videoPlaceholder: "box-jump.jpg"
    }
};

// Workout Plans (for the new Train view)
export const WorkoutPlans = [
    {
        id: "p1",
        name: "Leg Day (Hypertrophy)",
        description: "Focus on quadriceps and glutes.",
        exercises: [
            { name: "Barbell Squat", sets: 4, reps: "8-10" },
            { name: "Romanian Deadlift", sets: 3, reps: "10-12" },
            { name: "Bulgarian Split Squat", sets: 3, reps: "12 (per leg)" },
            { name: "Calf Raises", sets: 4, reps: "15-20" }
        ]
    },
    {
        id: "p2",
        name: "Chest & Back (Power)",
        description: "Upper body with a focus on strength.",
        exercises: [
            { name: "Dumbbell Bench Press", sets: 4, reps: "5-8" },
            { name: "Pull ups", sets: 4, reps: "Max" },
            { name: "Dumbbell Row", sets: 3, reps: "8-10" }
        ]
    }
];

// Profile Stats & Social Mock Data
export const ProfileData = {
    stats: {
        weeklyWorkouts: 3,
        weeklyComparison: "+1 vs last week",
        monthlyWorkouts: 14,
        monthlyComparison: "-2 vs last month",
        yearlyWorkouts: 142,
        yearlyComparison: "+12% y/y"
    },
    buddies: [
        { id: "b1", name: "Michael T.", match: "94%", commonGoals: ["Strength", "Hypertrophy"], loadSimilarity: "Very similar", schedule: "Tuesdays, Thursdays evening" },
        { id: "b2", name: "Kate M.", match: "88%", commonGoals: ["Conditioning", "Consistency"], loadSimilarity: "Similar", schedule: "Morning 7:00" }
    ],
    trainers: [
        { id: "t1", name: "Coach Thomas", specialty: "Strength Training" }
    ],
    diet: {
        status: "Goal: 2800 kcal",
        protein: "160g"
    },
    aiRecommendations: [
        "Focus on extending sleep on workout days.",
        "Decrease volume in isolation exercises for arms (plateau)."
    ]
};

// Past Workouts History
export const WorkoutHistory = [
    {
        id: "w1",
        date: "28.01",
        title: "Upper Body Power",
        aiInsight: "Great progress in volume (Load) compared to last week. Duration shorter by 5 min.",
        exercises: [
            { id: "e1", name: "Pull ups", loadChart: [50, 55, 52, 60], timeChart: [40, 45, 42, 40], repsChart: [8, 8, 7, 6], ref: "exX" },
            { id: "e2", name: "Dumbbell Rows", loadChart: [30, 32, 32, 34], timeChart: [30, 32, 35, 30], repsChart: [10, 10, 8, 8], ref: "ex8" }
        ]
    }
];

// Diet History & Entries
export const DietData = {
    macros: { protein: 45, fat: 30, carbs: 25 }, // Percentages
    entries: [
        { id: "d1", name: "Protein Oatmeal", time: "08:00", kcal: 450 },
        { id: "d2", name: "Chicken with Rice", time: "13:30", kcal: 650 },
        { id: "d3", name: "Post-workout Shake", time: "18:00", kcal: 250 }
    ],
    aiRecommendation: "Given your heavy leg workout today, we suggest increasing carbohydrates in your next meal by 15%."
};

// Trainer Portal Data - NOW "Find Your Trainer"
export const AvailableTrainers = [
    { 
        id: "tr1", 
        name: "Mark Johnson", 
        specialty: "Powerlifting",
        match: "98%",
        desc: "Elite powerlifting coach. Specializes in squat mechanics and peaking programs for raw lifters."
    },
    { 
        id: "tr2", 
        name: "Sarah Williams", 
        specialty: "Bodybuilding & Rehab",
        match: "85%",
        desc: "Focuses on hypertrophy and joint health. Great for breaking through plateaus while avoiding injury."
    },
    { 
        id: "tr3", 
        name: "Alex Cross", 
        specialty: "Crossfit & Mobility",
        match: "72%",
        desc: "High-intensity conditioning combined with deep yoga flow for active recovery."
    }
];
