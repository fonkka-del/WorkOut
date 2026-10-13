export const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
  'Cardio',
  'Full Body'
];

export const EQUIPMENT_TYPES = [
  'Barbell',
  'Dumbbell',
  'Machine',
  'Cable',
  'Bodyweight',
  'Kettlebell',
  'Smith Machine',
  'Cardio Machine',
  'Other'
];

export const DEFAULT_EXERCISES = [
  // CHEST
  { id: 'ex_bench_press', name: 'Barbell Bench Press', category: 'Chest', equipment: 'Barbell', isCustom: false },
  { id: 'ex_incline_db_press', name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_cable_fly', name: 'Cable Chest Fly', category: 'Chest', equipment: 'Cable', isCustom: false },
  { id: 'ex_chest_dips', name: 'Chest Dips', category: 'Chest', equipment: 'Bodyweight', isCustom: false },
  { id: 'ex_machine_chest_press', name: 'Machine Chest Press', category: 'Chest', equipment: 'Machine', isCustom: false },
  { id: 'ex_pushups', name: 'Push-Ups', category: 'Chest', equipment: 'Bodyweight', isCustom: false },
  { id: 'ex_decline_bench', name: 'Decline Bench Press', category: 'Chest', equipment: 'Barbell', isCustom: false },

  // BACK
  { id: 'ex_deadlift', name: 'Barbell Deadlift', category: 'Back', equipment: 'Barbell', isCustom: false },
  { id: 'ex_pullups', name: 'Pull-Ups / Chin-Ups', category: 'Back', equipment: 'Bodyweight', isCustom: false },
  { id: 'ex_barbell_row', name: 'Bent-Over Barbell Row', category: 'Back', equipment: 'Barbell', isCustom: false },
  { id: 'ex_lat_pulldown', name: 'Lat Pulldown', category: 'Back', equipment: 'Cable', isCustom: false },
  { id: 'ex_seated_cable_row', name: 'Seated Cable Row', category: 'Back', equipment: 'Cable', isCustom: false },
  { id: 'ex_db_row', name: 'Single-Arm Dumbbell Row', category: 'Back', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_face_pull', name: 'Face Pull', category: 'Back', equipment: 'Cable', isCustom: false },
  { id: 'ex_tbar_row', name: 'T-Bar Row', category: 'Back', equipment: 'Machine', isCustom: false },

  // LEGS
  { id: 'ex_barbell_squat', name: 'Barbell Back Squat', category: 'Legs', equipment: 'Barbell', isCustom: false },
  { id: 'ex_front_squat', name: 'Front Squat', category: 'Legs', equipment: 'Barbell', isCustom: false },
  { id: 'ex_leg_press', name: 'Leg Press', category: 'Legs', equipment: 'Machine', isCustom: false },
  { id: 'ex_rdl', name: 'Romanian Deadlift (RDL)', category: 'Legs', equipment: 'Barbell', isCustom: false },
  { id: 'ex_bulgarian_split_squat', name: 'Bulgarian Split Squat', category: 'Legs', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_leg_extension', name: 'Leg Extension', category: 'Legs', equipment: 'Machine', isCustom: false },
  { id: 'ex_leg_curl', name: 'Hamstring Leg Curl', category: 'Legs', equipment: 'Machine', isCustom: false },
  { id: 'ex_standing_calf_raise', name: 'Calf Raise', category: 'Legs', equipment: 'Machine', isCustom: false },
  { id: 'ex_lunges', name: 'Walking Lunges', category: 'Legs', equipment: 'Dumbbell', isCustom: false },

  // SHOULDERS
  { id: 'ex_overhead_press', name: 'Overhead Barbell Press (OHP)', category: 'Shoulders', equipment: 'Barbell', isCustom: false },
  { id: 'ex_db_shoulder_press', name: 'Dumbbell Shoulder Press', category: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_lateral_raise', name: 'Dumbbell Lateral Raise', category: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_cable_lateral_raise', name: 'Cable Lateral Raise', category: 'Shoulders', equipment: 'Cable', isCustom: false },
  { id: 'ex_reverse_fly', name: 'Rear Delt Reverse Fly', category: 'Shoulders', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_arnold_press', name: 'Arnold Press', category: 'Shoulders', equipment: 'Dumbbell', isCustom: false },

  // ARMS
  { id: 'ex_barbell_curl', name: 'Barbell Bicep Curl', category: 'Arms', equipment: 'Barbell', isCustom: false },
  { id: 'ex_db_incline_curl', name: 'Incline Dumbbell Curl', category: 'Arms', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_hammer_curl', name: 'Hammer Curl', category: 'Arms', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_tricep_rope_pushdown', name: 'Tricep Rope Pushdown', category: 'Arms', equipment: 'Cable', isCustom: false },
  { id: 'ex_skull_crushers', name: 'Skull Crushers', category: 'Arms', equipment: 'Barbell', isCustom: false },
  { id: 'ex_overhead_tricep_ext', name: 'Overhead Tricep Extension', category: 'Arms', equipment: 'Dumbbell', isCustom: false },
  { id: 'ex_preacher_curl', name: 'Preacher Curl', category: 'Arms', equipment: 'Machine', isCustom: false },

  // CORE
  { id: 'ex_hanging_leg_raise', name: 'Hanging Leg Raise', category: 'Core', equipment: 'Bodyweight', isCustom: false },
  { id: 'ex_cable_crunch', name: 'Cable Crunch', category: 'Core', equipment: 'Cable', isCustom: false },
  { id: 'ex_plank', name: 'Plank', category: 'Core', equipment: 'Bodyweight', isCustom: false },
  { id: 'ex_ab_wheel', name: 'Ab Wheel Rollout', category: 'Core', equipment: 'Other', isCustom: false },
  { id: 'ex_russian_twist', name: 'Russian Twist', category: 'Core', equipment: 'Bodyweight', isCustom: false },

  // CARDIO
  { id: 'ex_treadmill', name: 'Treadmill Running', category: 'Cardio', equipment: 'Cardio Machine', isCustom: false },
  { id: 'ex_stairmaster', name: 'Stairmaster', category: 'Cardio', equipment: 'Cardio Machine', isCustom: false },
  { id: 'ex_rowing_machine', name: 'Rowing Machine', category: 'Cardio', equipment: 'Cardio Machine', isCustom: false },
  { id: 'ex_stationary_bike', name: 'Stationary Bike', category: 'Cardio', equipment: 'Cardio Machine', isCustom: false }
];
