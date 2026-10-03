// GymBud Mock Data Store - Now fetching from Backend

export let UserProfile = null;
export let History = null;
export let TodayPlan = null;
export let ExerciseDB = null;
export let WorkoutPlans = null;
export let ProfileData = null;
export let WorkoutHistory = null;
export let DietData = null;
export let AvailableTrainers = null;

export async function initData() {
    try {
        const [
            profileRes,
            historyRes,
            todayPlanRes,
            exercisesRes,
            workoutPlansRes,
            profileDataRes,
            workoutHistoryRes,
            dietRes,
            trainersRes
        ] = await Promise.all([
            fetch('/api/profile'),
            fetch('/api/history'),
            fetch('/api/today-plan'),
            fetch('/api/exercises'),
            fetch('/api/workout-plans'),
            fetch('/api/profile-data'),
            fetch('/api/workout-history'),
            fetch('/api/diet'),
            fetch('/api/trainers')
        ]);

        UserProfile = await profileRes.json();
        History = await historyRes.json();
        TodayPlan = await todayPlanRes.json();
        ExerciseDB = await exercisesRes.json();
        WorkoutPlans = await workoutPlansRes.json();
        ProfileData = await profileDataRes.json();
        WorkoutHistory = await workoutHistoryRes.json();
        DietData = await dietRes.json();
        AvailableTrainers = await trainersRes.json();
        
        console.log("Backend data loaded successfully.");
    } catch (error) {
        console.error("Failed to fetch data from backend:", error);
    }
}
