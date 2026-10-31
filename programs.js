// برامج FORMA. كل جلسة: [التمرين، الجولات، العدات]
// mine = من جداول ملف FORMA مباشرة
window.FORMA_PROGRAMS = {
fb4:{name:"Full Body",ar:"فل بودي",days:4,weeks:13,mine:true,level:"مبتدئ إلى متوسط",sessions:[
 {n:"A",ex:[["Leg Press Machine",3,"6-10"],["Lat Pulldown",3,"8-12"],["Flat Chest Press",3,"8-10"],["Cable Lateral Raise",2,"8-12"],["Triceps Pushdown",3,"8-12"],["Behind-the-Back Cable Curl",2,"8-10"],["Calf Raise Machine",3,"8-12"]]},
 {n:"B",ex:[["T-Bar Row",3,"8-12"],["Incline Chest Press",3,"8-10"],["Shoulder Press Machine",2,"8-12"],["Seated Leg Curl",3,"8-12"],["Overhead Triceps Extension",3,"8-12"],["Cable Reverse Curl",2,"8-12"],["Cable Crunch",3,"8-12"]]},
 {n:"C",ex:[["Chest Fly Machine",3,"8-10"],["Seated Row Machine",2,"8-12"],["Leg Press Machine",3,"6-10"],["Leg Extension",2,"8-12"],["Cable Lateral Raise",3,"8-12"],["Preacher Curl Machine",3,"8-12"],["Calf Raise Machine",2,"8-12"]]},
 {n:"D",ex:[["Seated Leg Curl",2,"8-12"],["T-Bar Row",2,"8-12"],["Incline Chest Press",2,"8-10"],["Rear Delt Fly",2,"8-12"],["Hip Thrust",2,"8-12"],["Adductor Machine",2,"8-12"],["Shrug Machine",2,"8-12"],["Cable Crunch",3,"8-12"]]}]},
ap4:{name:"Anterior / Posterior",ar:"أمامي وخلفي",days:4,weeks:8,mine:true,level:"متوسط",sessions:[
 {n:"Anterior 1",ex:[["Hack Squat",3,"6-8"],["Incline Dumbbell Press",3,"8-10"],["Leg Extension",3,"10-12"],["Cable Lateral Raise",3,"12-15"],["Bayesian Cable Curl",3,"10-12"],["Cable Crunch",3,"10-15"]]},
 {n:"Posterior 1",ex:[["Romanian Deadlift",3,"6-8"],["Chest-Supported Row",3,"8-10"],["Lat Pulldown",3,"8-10"],["Seated Leg Curl",3,"10-12"],["Overhead Triceps Extension",3,"10-12"],["Reverse Pec Deck",3,"12-15"]]},
 {n:"Anterior 2",ex:[["Machine Chest Press",3,"6-8"],["Leg Press",3,"8-10"],["Cable Chest Fly",3,"10-15"],["Leg Extension",3,"12-15"],["Dumbbell Lateral Raise",3,"12-15"],["Preacher Curl",3,"8-12"]]},
 {n:"Posterior 2",ex:[["Pull-Up",3,"6-10"],["Hip Thrust",3,"8-10"],["Seated Cable Row",3,"10-12"],["Lying Leg Curl",3,"10-12"],["Triceps Pushdown",3,"10-12"],["Standing Calf Raise",3,"10-12"]]}]},
pplap:{name:"PPL + Anterior / Posterior",ar:"بوش بول ليقز + أمامي وخلفي",days:5,weeks:8,mine:true,level:"متوسط إلى متقدم",sessions:[
 {n:"Push A",ex:[["Incline Chest Press",2,"8-10"],["Chest Fly Machine",2,"8-10"],["Flat Chest Press Machine",2,"8-10"],["Cable Lateral Raise",3,"8-12"],["Triceps Pushdown",3,"8-12"],["Cable Crunch",2,"8-12"]]},
 {n:"Pull A",ex:[["T-Bar Row",3,"8-12"],["Lat Pulldown",3,"8-12"],["Iliac Lat Pulldown",2,"8-12"],["Rear Delt Machine",3,"8-12"],["Behind-the-Back Cable Curl",2,"8-10"],["Shrug Machine",2,"8-12"]]},
 {n:"Legs",ex:[["Leg Press",3,"6-10"],["Leg Extension",2,"8-12"],["Seated Leg Curl",3,"8-12"],["Adductor Machine",3,"8-12"],["Hip Thrust",3,"8-12"],["Calf Raise Machine",3,"8-12"],["Cable Crunch",3,"8-12"]]},
 {n:"Push B + Anterior",ex:[["Cable Lateral Raise",3,"8-12"],["Flat Chest Press Machine",2,"8-10"],["Chest Fly Machine",2,"8-10"],["Incline Chest Press",2,"8-10"],["Leg Extension",2,"8-12"],["Shoulder Press Machine",2,"8-12"],["Overhead Triceps Extension",3,"8-12"],["Cable Crunch",2,"8-12"]]},
 {n:"Pull B + Posterior",ex:[["T-Bar Row",3,"8-12"],["Lat Pulldown",3,"8-12"],["Seated Row Machine",2,"8-12"],["Seated Leg Curl",3,"8-12"],["Preacher Curl Machine",2,"8-12"],["Cable Reverse Curl",2,"8-12"],["Rear Delt Machine",3,"8-12"]]}]},
fb3:{name:"Full Body",ar:"فل بودي",days:3,weeks:8,level:"مبتدئ",sessions:[
 {n:"A",ex:[["Leg Press Machine",3,"6-10"],["Flat Chest Press",3,"8-10"],["Lat Pulldown",3,"8-12"],["Seated Leg Curl",2,"8-12"],["Cable Lateral Raise",2,"8-12"],["Triceps Pushdown",2,"8-12"]]},
 {n:"B",ex:[["Romanian Deadlift",3,"6-8"],["Incline Chest Press",3,"8-10"],["T-Bar Row",3,"8-12"],["Leg Extension",2,"8-12"],["Shoulder Press Machine",2,"8-12"],["Preacher Curl Machine",2,"8-12"]]},
 {n:"C",ex:[["Hack Squat",3,"6-10"],["Seated Row Machine",3,"8-12"],["Chest Fly Machine",2,"8-10"],["Hip Thrust",2,"8-12"],["Rear Delt Machine",2,"8-12"],["Overhead Triceps Extension",2,"8-12"],["Calf Raise Machine",2,"8-12"]]}]},
ul4:{name:"Upper / Lower",ar:"علوي وسفلي",days:4,weeks:8,level:"مبتدئ إلى متوسط",sessions:[
 {n:"Upper A",ex:[["Flat Chest Press",3,"8-10"],["T-Bar Row",3,"8-12"],["Shoulder Press Machine",2,"8-12"],["Lat Pulldown",2,"8-12"],["Cable Lateral Raise",2,"8-12"],["Triceps Pushdown",2,"8-12"],["Behind-the-Back Cable Curl",2,"8-10"]]},
 {n:"Lower A",ex:[["Leg Press",3,"6-10"],["Seated Leg Curl",3,"8-12"],["Leg Extension",2,"8-12"],["Adductor Machine",2,"8-12"],["Calf Raise Machine",3,"8-12"],["Cable Crunch",2,"8-12"]]},
 {n:"Upper B",ex:[["Incline Chest Press",3,"8-10"],["Lat Pulldown",3,"8-12"],["Chest Fly Machine",2,"8-10"],["Seated Row Machine",2,"8-12"],["Rear Delt Machine",2,"8-12"],["Overhead Triceps Extension",2,"8-12"],["Preacher Curl Machine",2,"8-12"]]},
 {n:"Lower B",ex:[["Romanian Deadlift",3,"6-8"],["Hack Squat",3,"6-10"],["Lying Leg Curl",2,"8-12"],["Hip Thrust",2,"8-12"],["Calf Raise Machine",2,"8-12"],["Cable Crunch",2,"8-12"]]}]},
ulppl:{name:"Upper / Lower + PPL",ar:"علوي وسفلي + بوش بول ليقز",days:5,weeks:8,level:"متوسط",sessions:[
 {n:"Upper",ex:[["Flat Chest Press",3,"8-10"],["T-Bar Row",3,"8-12"],["Shoulder Press Machine",2,"8-12"],["Lat Pulldown",2,"8-12"],["Cable Lateral Raise",2,"8-12"],["Triceps Pushdown",2,"8-12"],["Behind-the-Back Cable Curl",2,"8-10"]]},
 {n:"Lower",ex:[["Leg Press",3,"6-10"],["Seated Leg Curl",3,"8-12"],["Leg Extension",2,"8-12"],["Adductor Machine",2,"8-12"],["Calf Raise Machine",3,"8-12"],["Cable Crunch",2,"8-12"]]},
 {n:"Push",ex:[["Incline Chest Press",3,"8-10"],["Chest Fly Machine",2,"8-10"],["Shoulder Press Machine",2,"8-12"],["Cable Lateral Raise",3,"8-12"],["Overhead Triceps Extension",2,"8-12"]]},
 {n:"Pull",ex:[["Lat Pulldown",3,"8-12"],["Seated Row Machine",3,"8-12"],["Rear Delt Machine",2,"8-12"],["Preacher Curl Machine",2,"8-12"],["Cable Reverse Curl",2,"8-12"],["Shrug Machine",2,"8-12"]]},
 {n:"Legs",ex:[["Hack Squat",3,"6-10"],["Romanian Deadlift",2,"6-8"],["Lying Leg Curl",2,"8-12"],["Hip Thrust",2,"8-12"],["Calf Raise Machine",3,"8-12"],["Cable Crunch",2,"8-12"]]}]},
ppl:{name:"Push Pull Legs",ar:"بوش بول ليقز",days:6,weeks:8,level:"متوسط إلى متقدم",sessions:[
 {n:"Push",ex:[["Incline Chest Press",3,"8-10"],["Flat Chest Press Machine",2,"8-10"],["Shoulder Press Machine",2,"8-12"],["Cable Lateral Raise",3,"8-12"],["Triceps Pushdown",2,"8-12"],["Overhead Triceps Extension",2,"8-12"]]},
 {n:"Pull",ex:[["T-Bar Row",3,"8-12"],["Lat Pulldown",3,"8-12"],["Seated Row Machine",2,"8-12"],["Rear Delt Machine",2,"8-12"],["Behind-the-Back Cable Curl",2,"8-10"],["Preacher Curl Machine",2,"8-12"]]},
 {n:"Legs",ex:[["Leg Press",3,"6-10"],["Romanian Deadlift",2,"6-8"],["Seated Leg Curl",3,"8-12"],["Leg Extension",2,"8-12"],["Calf Raise Machine",3,"8-12"],["Cable Crunch",2,"8-12"]]}]}
};
window.FORMA_PROGRAM_ORDER=["fb3","fb4","ul4","ap4","ulppl","pplap","ppl"];

// بدائل لو الجهاز مشغول أو مو موجود
window.FORMA_ALTS = {
"Lat Pulldown":["Assisted Pull-Up","Pull-Up","Close-Grip Lat Pulldown"],
"Iliac Lat Pulldown":["Lat Pulldown","Close-Grip Lat Pulldown"],
"Pull-Up":["Assisted Pull-Up","Lat Pulldown"],
"T-Bar Row":["Chest-Supported Row","Seated Row Machine","Seated Cable Row"],
"Seated Row Machine":["Seated Cable Row","Chest-Supported Row","T-Bar Row"],
"Chest-Supported Row":["T-Bar Row","Seated Cable Row"],
"Seated Cable Row":["Seated Row Machine","T-Bar Row"],
"Flat Chest Press":["Flat Chest Press Machine","Bench Press","Dumbbell Bench Press"],
"Flat Chest Press Machine":["Flat Chest Press","Bench Press","Dumbbell Bench Press"],
"Machine Chest Press":["Bench Press","Dumbbell Bench Press"],
"Incline Chest Press":["Incline Dumbbell Press","Incline Bench Press"],
"Incline Dumbbell Press":["Incline Chest Press","Incline Bench Press"],
"Chest Fly Machine":["Cable Chest Fly","Pec Deck Fly"],
"Cable Chest Fly":["Chest Fly Machine","Pec Deck Fly"],
"Shoulder Press Machine":["Dumbbell Shoulder Press","Overhead Press"],
"Cable Lateral Raise":["Dumbbell Lateral Raise","Lateral Raise Machine"],
"Dumbbell Lateral Raise":["Cable Lateral Raise","Lateral Raise Machine"],
"Rear Delt Machine":["Reverse Pec Deck","Face Pull","Rear Delt Fly"],
"Reverse Pec Deck":["Rear Delt Machine","Face Pull"],
"Rear Delt Fly":["Rear Delt Machine","Face Pull"],
"Triceps Pushdown":["Rope Pushdown","Dips"],
"Overhead Triceps Extension":["Cable Overhead Extension","Skull Crusher"],
"Behind-the-Back Cable Curl":["Bayesian Cable Curl","Incline Dumbbell Curl"],
"Bayesian Cable Curl":["Behind-the-Back Cable Curl","Incline Dumbbell Curl"],
"Preacher Curl Machine":["Preacher Curl","EZ Bar Curl"],
"Preacher Curl":["Preacher Curl Machine","EZ Bar Curl"],
"Cable Reverse Curl":["Hammer Curl","EZ Bar Reverse Curl"],
"Leg Press Machine":["Hack Squat","Pendulum Squat","Back Squat"],
"Leg Press":["Hack Squat","Pendulum Squat","Back Squat"],
"Hack Squat":["Leg Press","Pendulum Squat","Back Squat"],
"Leg Extension":["Sissy Squat"],
"Seated Leg Curl":["Lying Leg Curl"],
"Lying Leg Curl":["Seated Leg Curl"],
"Romanian Deadlift":["Stiff-Leg Deadlift","45° Back Extension"],
"Hip Thrust":["Glute Bridge","Hip Thrust Machine"],
"Adductor Machine":["Copenhagen Plank"],
"Calf Raise Machine":["Standing Calf Raise","Seated Calf Raise","Leg Press Calf Raise"],
"Standing Calf Raise":["Calf Raise Machine","Seated Calf Raise"],
"Shrug Machine":["Dumbbell Shrug"],
"Cable Crunch":["Hanging Leg Raise","Machine Crunch"]
};

// خطتك المقترحة (من صفحة الخطة) محسوبة على 2200 سعرة: [الأكلة، الكمية بالجرام]
window.FORMA_PLAN = {
"فطور":[[["فول مدمس",215],["بيض مسلوق",100],["خبز عربي بر",60]],[["بيض مسلوق",150],["جبن حلوم",50],["خبز عربي بر",60]],[["زبادي يوناني قليل الدسم",355],["شوفان",60],["موز",115]]],
"غداء":[[["كبسة دجاج",365],["صدر دجاج مشوي",75],["سلطة خضار بدون صوص",150]],[["صدر دجاج مشوي",225],["رز بسمتي مطبوخ",310],["سلطة خضار بدون صوص",150]],[["مكرونة مطبوخة",240],["لحم بقر مفروم",145],["سلطة خضار بدون صوص",150]]],
"عشاء":[[["تونة بالماء",195],["خبز عربي بر",60],["أفوكادو",100]],[["صدر دجاج مشوي",170],["خبز عربي بر",60],["حمص متبل",65]],[["سالمون",175],["بطاطا حلوة",175],["بروكلي",100]]],
"سناك":[[["زبادي يوناني قليل الدسم",270],["فراولة",205],["لوز",20]],[["واي بروتين",30],["موز",120],["زبدة فول سوداني",15]],[["تمر",24],["لبن",260],["لوز",20]]]
};
