// برامج FORMA. كل جلسة: [التمرين، الجولات، العدات]
// نفس جداول ملفات FORMA: الأيام المقترحة والجولات والعدات
window.FORMA_PROGRAMS = {
fb4:{name:"Full Body",ar:"فل بودي",days:4,weeks:13,sessions:[
 {n:"A",day:"الاثنين",ex:[["Leg Press Machine",3,"6-10"],["Lat Pulldown",3,"8-12"],["Flat Chest Press",3,"8-10"],["Cable Lateral Raise",2,"8-12"],["Triceps Pushdown",3,"8-12"],["Behind-the-Back Cable Curl",2,"8-10"],["Calf Raise Machine",3,"8-12"]]},
 {n:"B",day:"الأربعاء",ex:[["T-Bar Row",3,"8-12"],["Incline Chest Press",3,"8-10"],["Shoulder Press Machine",2,"8-12"],["Seated Leg Curl",3,"8-12"],["Overhead Triceps Extension",3,"8-12"],["Cable Reverse Curl",2,"8-12"],["Cable Crunch",3,"8-12"]]},
 {n:"C",day:"الخميس",ex:[["Chest Fly Machine",3,"8-10"],["Seated Row Machine",2,"8-12"],["Leg Press Machine",3,"6-10"],["Leg Extension",2,"8-12"],["Cable Lateral Raise",3,"8-12"],["Preacher Curl Machine",3,"8-12"],["Calf Raise Machine",2,"8-12"]]},
 {n:"D",day:"السبت",ex:[["Seated Leg Curl",2,"8-12"],["T-Bar Row",2,"8-12"],["Incline Chest Press",2,"8-10"],["Rear Delt Fly",2,"8-12"],["Hip Thrust",2,"8-12"],["Adductor Machine",2,"8-12"],["Shrug Machine",2,"8-12"],["Cable Crunch",3,"8-12"]]}]},
ap4:{name:"Anterior / Posterior",ar:"أمامي وخلفي",days:4,weeks:8,sessions:[
 {n:"Anterior 1",day:"الاثنين",ex:[["Hack Squat",3,"6-8"],["Incline Dumbbell Press",3,"8-10"],["Leg Extension",3,"10-12"],["Cable Lateral Raise",3,"12-15"],["Bayesian Cable Curl",3,"10-12"],["Cable Crunch",3,"10-15"]]},
 {n:"Posterior 1",day:"الأربعاء",ex:[["Romanian Deadlift",3,"6-8"],["Chest-Supported Row",3,"8-10"],["Lat Pulldown",3,"8-10"],["Seated Leg Curl",3,"10-12"],["Overhead Triceps Extension",3,"10-12"],["Reverse Pec Deck",3,"12-15"]]},
 {n:"Anterior 2",day:"الخميس",ex:[["Machine Chest Press",3,"6-8"],["Leg Press",3,"8-10"],["Cable Chest Fly",3,"10-15"],["Leg Extension",3,"12-15"],["Dumbbell Lateral Raise",3,"12-15"],["Preacher Curl",3,"8-12"]]},
 {n:"Posterior 2",day:"السبت",ex:[["Pull-Up",3,"6-10"],["Hip Thrust",3,"8-10"],["Seated Cable Row",3,"10-12"],["Lying Leg Curl",3,"10-12"],["Triceps Pushdown",3,"10-12"],["Standing Calf Raise",3,"10-12"]]}]},
pplap:{name:"PPL + Anterior / Posterior",ar:"بوش بول ليقز + أمامي وخلفي",days:5,weeks:8,sessions:[
 {n:"Push A",day:"السبت",ex:[["Incline Chest Press",2,"8-10"],["Chest Fly Machine",2,"8-10"],["Flat Chest Press Machine",2,"8-10"],["Cable Lateral Raise",3,"8-12"],["Triceps Pushdown",3,"8-12"],["Cable Crunch",2,"8-12"]]},
 {n:"Pull A",day:"الأحد",ex:[["T-Bar Row",3,"8-12"],["Lat Pulldown",3,"8-12"],["Iliac Lat Pulldown",2,"8-12"],["Rear Delt Machine",3,"8-12"],["Behind-the-Back Cable Curl",2,"8-10"],["Shrug Machine",2,"8-12"]]},
 {n:"Legs",day:"الاثنين",ex:[["Leg Press",3,"6-10"],["Leg Extension",2,"8-12"],["Seated Leg Curl",3,"8-12"],["Adductor Machine",3,"8-12"],["Hip Thrust",3,"8-12"],["Calf Raise Machine",3,"8-12"],["Cable Crunch",3,"8-12"]]},
 {n:"Push B + Anterior",day:"الأربعاء",ex:[["Cable Lateral Raise",3,"8-12"],["Flat Chest Press Machine",2,"8-10"],["Chest Fly Machine",2,"8-10"],["Incline Chest Press",2,"8-10"],["Leg Extension",2,"8-12"],["Shoulder Press Machine",2,"8-12"],["Overhead Triceps Extension",3,"8-12"],["Cable Crunch",2,"8-12"]]},
 {n:"Pull B + Posterior",day:"الخميس",ex:[["T-Bar Row",3,"8-12"],["Lat Pulldown",3,"8-12"],["Seated Row Machine",2,"8-12"],["Seated Leg Curl",3,"8-12"],["Preacher Curl Machine",2,"8-12"],["Cable Reverse Curl",2,"8-12"],["Rear Delt Machine",3,"8-12"]]}]}

};
window.FORMA_PROGRAM_ORDER=["fb4","ap4","pplap"];

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
"Cable Crunch":["Hanging Leg Raise","Machine Crunch"],
"Wide Grip Row":["Seated Row Machine","T-Bar Row","Seated Cable Row"],
"T-Bar Row (Lower Traps)":["T-Bar Row","Chest-Supported Row"],
"Lat Row":["Seated Row Machine","Seated Cable Row","Chest-Supported Row"],
"Pec Deck":["Chest Fly Machine","Cable Chest Fly"],
"Incline Machine Press":["Incline Chest Press","Incline Dumbbell Press"],
"Flat Press":["Flat Chest Press Machine","Bench Press","Dumbbell Bench Press"],
"Cable Upper Chest Fly":["Cable Chest Fly","Chest Fly Machine"],
"DB Lateral Raise":["Cable Lateral Raise","Lateral Raise Machine"],
"Lateral Raise Machine":["Cable Lateral Raise","Dumbbell Lateral Raise"],
"Rear Delt Cable Fly":["Rear Delt Machine","Reverse Pec Deck","Face Pull"],
"Machine Shoulder Press":["Shoulder Press Machine","Dumbbell Shoulder Press"],
"Seated Hamstring Curl":["Seated Leg Curl","Lying Leg Curl"],
"Behind-the-Back D-Handle Curl":["Behind-the-Back Cable Curl","Bayesian Cable Curl"],
"Rope Pushdown":["Triceps Pushdown","Cable Overhead Extension"],
"Shrugs":["Shrug Machine","Dumbbell Shrug"],
"Cable Biceps Curl":["EZ Bar Curl","Dumbbell Curl"],
"Preacher Dumbbell Curl":["Preacher Curl Machine","Preacher Curl"]
};

// خطتك المقترحة (من صفحة الخطة) محسوبة على 2200 سعرة: [الأكلة، الكمية بالجرام]
window.FORMA_PLAN = {
"فطور":[[["فول مدمس",215],["بيض مسلوق",100],["خبز عربي بر",60]],[["بيض مسلوق",150],["جبن حلوم",50],["خبز عربي بر",60]],[["زبادي يوناني قليل الدسم",355],["شوفان",60],["موز",115]]],
"غداء":[[["كبسة دجاج",365],["صدر دجاج مشوي",75],["سلطة خضار بدون صوص",150]],[["صدر دجاج مشوي",225],["رز بسمتي مطبوخ",310],["سلطة خضار بدون صوص",150]],[["مكرونة مطبوخة",240],["لحم بقر مفروم",145],["سلطة خضار بدون صوص",150]]],
"عشاء":[[["تونة بالماء",195],["خبز عربي بر",60],["أفوكادو",100]],[["صدر دجاج مشوي",170],["خبز عربي بر",60],["حمص متبل",65]],[["سالمون",175],["بطاطا حلوة",175],["بروكلي",100]]],
"سناك":[[["زبادي يوناني قليل الدسم",270],["فراولة",205],["لوز",20]],[["واي بروتين",30],["موز",120],["زبدة فول سوداني",15]],[["تمر",24],["لبن",260],["لوز",20]]]
};

/* أسماء التمارين بالعربي (سطر صغير تحت الاسم الإنجليزي) */
window.FORMA_AR = {
"45° Back Extension":"تمديد الظهر 45°","Adductor Machine":"جهاز ضم الفخذ","Assisted Pull-Up":"عقلة بالمساعدة","Back Squat":"سكوات بالبار",
"Banded Side Walk":"مشي جانبي بالمطاط","Bayesian Cable Curl":"بايسبس كيبل من ورا","Behind-the-Back Cable Curl":"بايسبس كيبل من ورا الظهر","Behind-the-Back D-Handle Curl":"بايسبس كيبل من ورا الظهر بمقبض",
"Bench Press":"بنش مستوي بالبار","Cable Biceps Curl":"بايسبس بالكيبل","Cable Chest Fly":"تفتيح صدر بالكيبل","Cable Crunch":"بطن بالكيبل",
"Cable Hip Abduction":"تبعيد الورك بالكيبل","Cable Lateral Raise":"رفرفة جانبي بالكيبل","Cable Overhead Extension":"ترايسبس فوق الراس بالكيبل","Cable Reverse Curl":"كيرل عكسي بالكيبل",
"Cable Rope Hammer Curl":"هامر بالحبل","Cable Upper Chest Fly":"تفتيح صدر علوي بالكيبل","Calf Raise Machine":"جهاز السمانة","Chest Fly Machine":"جهاز تفتيح الصدر",
"Chest Press Machine":"جهاز دفع الصدر","Chest-Supported Row":"سحب مسنود على الصدر","Close-Grip Lat Pulldown":"سحب أمامي قبضة ضيقة","Copenhagen Plank":"بلانك جانبي كوبنهاقن",
"DB Lateral Raise":"رفرفة جانبي بالدمبل","Dips":"متوازي","Dumbbell Bench Press":"بنش مستوي بالدمبل","Dumbbell Curl":"بايسبس بالدمبل",
"Dumbbell Lateral Raise":"رفرفة جانبي بالدمبل","Dumbbell Shoulder Press":"دفع كتف بالدمبل","Dumbbell Shrug":"ترابيس بالدمبل","EZ Bar Curl":"بايسبس بالبار المتعرج",
"EZ Bar Reverse Curl":"كيرل عكسي بالبار المتعرج","Face Pull":"فيس بول بالحبل","Flat Chest Press":"دفع صدر مستوي","Flat Chest Press Machine":"جهاز صدر مستوي",
"Flat Press":"دفع صدر مستوي","Glute Bridge":"جسر الأرداف","Hack Squat":"هاك سكوات","Hammer Curl":"هامر بالدمبل",
"Hanging Leg Raise":"رفع الرجلين معلّق","Hip Abduction Machine":"جهاز تبعيد الورك","Hip Thrust":"هيب ثرست بالبار","Hip Thrust Machine":"جهاز هيب ثرست",
"Iliac Lat Pulldown":"سحب أمامي للظهر السفلي","Incline Bench Press":"بنش عالي بالبار","Incline Chest Press":"دفع صدر عالي","Incline Dumbbell Curl":"بايسبس دمبل على كرسي مائل",
"Incline Dumbbell Press":"بنش عالي بالدمبل","Incline Machine Press":"جهاز صدر عالي","Lat Pulldown":"سحب أمامي","Lat Row":"سحب أرضي للمجنص",
"Lateral Raise":"رفرفة جانبي","Lateral Raise Machine":"جهاز رفرفة جانبي","Leg Extension":"رجل أمامي (تمديد)","Leg Press":"دفع الرجل",
"Leg Press Calf Raise":"سمانة على جهاز الرجل","Leg Press Machine":"جهاز دفع الرجل","Lying Leg Curl":"رجل خلفي منبطح","Machine Chest Press":"جهاز دفع الصدر",
"Machine Crunch":"جهاز البطن","Machine Shoulder Press":"جهاز دفع الكتف","Overhead Press":"دفع كتف بالبار واقف","Overhead Tricep Extension":"ترايسبس فوق الراس",
"Overhead Triceps Extension":"ترايسبس فوق الراس","Pec Deck":"جهاز الفراشة","Pec Deck Fly":"جهاز الفراشة","Pendulum Squat":"سكوات بندولم",
"Preacher Curl":"بايسبس على كرسي بريتشر","Preacher Curl Machine":"جهاز بايسبس بريتشر","Preacher Dumbbell Curl":"بايسبس بريتشر بالدمبل","Pull-Up":"عقلة",
"Rear Delt Cable Fly":"كتف خلفي بالكيبل","Rear Delt Fly":"كتف خلفي","Rear Delt Machine":"جهاز كتف خلفي","Reverse Pec Deck":"كتف خلفي على جهاز الفراشة",
"Romanian Deadlift":"ديدلفت روماني","Rope Pushdown":"ترايسبس بالحبل","Seated Cable Row":"سحب أرضي بالكيبل","Seated Cable Row (Wide Grip)":"سحب أرضي قبضة عريضة",
"Seated Calf Raise":"سمانة جالس","Seated EZ Bar Curl":"بايسبس بالبار المتعرج جالس","Seated Hamstring Curl":"رجل خلفي جالس","Seated Leg Curl":"رجل خلفي جالس",
"Seated Row Machine":"جهاز سحب أرضي","Shoulder Press Machine":"جهاز دفع الكتف","Shrug Machine":"جهاز ترابيس","Shrugs":"ترابيس",
"Sissy Squat":"سيسي سكوات","Skull Crusher":"ترايسبس منبطح بالبار","Standing Calf Raise":"سمانة واقف","Stiff-Leg Deadlift":"ديدلفت برجل مفرودة",
"T-Bar Row":"سحب تي بار","T-Bar Row (Lower Traps)":"سحب تي بار للترابيس السفلي","Tricep Pushdown":"ترايسبس بالكيبل","Triceps Pushdown":"ترايسبس بالكيبل","Wide Grip Row":"سحب أرضي قبضة عريضة"
};
