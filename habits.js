function sendDailyHabitFormEmail() {
  const EMAIL_TO = 'kaeaston1@yahoo.com';
  const FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdledT5YONlsiLLJ88E7T274wdYEhXt3oKhESHXCrI_E-_X7Q/viewform?usp=header';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const htmlBody = `
    <div style="font-family: Arial, sans-serif;">
      <p>Log habits for <b>${yesterday.toDateString()}</b></p>
      <p>
        <a href="${FORM_URL}"
           style="display:inline-block;
                  padding:10px 16px;
                  background:#1a73e8;
                  color:white;
                  text-decoration:none;
                  border-radius:4px;">
          Open Habit Log Form
        </a>
      </p>
    </div>
  `;

  MailApp.sendEmail({
    to: EMAIL_TO,
    subject: 'Daily Habit Log',
    htmlBody: htmlBody
  });
}
function stdDevWakeTimeMinutes(bedtimes) {
  if (!bedtimes || bedtimes.length === 0) return 0;

  // Convert wake times to minutes since midnight
  const minutes = bedtimes
    .map(([_, wakeTime]) => 
      wakeTime.getHours() * 60 + wakeTime.getMinutes()
    )
    .filter(v => v !== null);

  if (minutes.length === 0) return 0;
  const mean = minutes.reduce((a, b) => a + b, 0) / minutes.length;

  const variance =
    minutes.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / minutes.length;

  return Math.round(Math.sqrt(variance));
}


function averageWakeTime(bedtimes) {
  if (!bedtimes || bedtimes.length === 0) return null;

  let totalMs = 0;

  bedtimes.forEach(([day, wakeTime]) => {
    // wakeTime is assumed to be a Date object
    const ms = wakeTime.getHours() * 60 * 60 * 1000 +
               wakeTime.getMinutes() * 60 * 1000 +
               wakeTime.getSeconds() * 1000;
    totalMs += ms;
  });

  const avgMs = totalMs / bedtimes.length;

  // Convert avgMs back to hours and minutes
  const avgHours = Math.floor(avgMs / (60 * 60 * 1000));
  const avgMinutes = Math.round((avgMs % (60 * 60 * 1000)) / (60 * 1000));

  // Format H:MM AM/PM
  const ampm = avgHours >= 12 ? 'PM' : 'AM';
  const hours12 = avgHours % 12 === 0 ? 12 : avgHours % 12;
  const minutesStr = avgMinutes.toString().padStart(2, '0');

  return `${hours12}:${minutesStr} ${ampm}`;
}

function averageScreenTime(screenTimes, ratings) {
  if (!screenTimes || screenTimes.length === 0) return { avgTime: '0:00', avgRating: 0 };

  let totalMinutesSum = 0;
  let ratingSum = 0;

  screenTimes.forEach(([hours, minutes, totalMinutes]) => {
    totalMinutesSum += totalMinutes;
  });

  ratings.forEach(r => {
    ratingSum += r;
  });

  const avgMinutes = totalMinutesSum / screenTimes.length;
  const avgRating = ratingSum / screenTimes.length;

  // Convert avgMinutes to HH:MM
  const hh = Math.floor(avgMinutes / 60);
  const mm = Math.round(avgMinutes % 60).toString().padStart(2, '0');
  const avgTime = `${hh}:${mm}`;

  return { avgTime, avgRating };
}

function renderMealCard({
  title,        // "Breakfast" | "Lunch" | "Dinner"
  accent,       // color for header bar
  items         // array of 7 strings
}) {

  const listItems = items.map(item => `
    <tr>
      <td style="
        padding:6px 0;
        font-size:13px;
        color:#444;
        border-bottom:1px solid #eee;
      ">
        ${item || '<span style="color:#aaa;">—</span>'}
      </td>
    </tr>
  `).join('');

  return `
    <div style="
      background:#ffffff;
      border-radius:14px;
      padding:0;
      box-shadow:0 4px 14px rgba(0,0,0,0.08);
      border-top:3px solid ${accent};
      height:100%;
    ">

      <!-- Header -->
      <div style="
        padding:16px 20px 12px;
        font-size:16px;
        font-weight:600;
        color:${accent};
      ">
        ${title}
      </div>

      <!-- Meal List -->
      <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 20px 16px;">
        ${listItems}
      </table>

    </div>
  `;
}


function renderCard({
  value,
  label,
  subtext = '',
  accent = '#1a73e8'
}) {
  return `
    <div style="
      background: #ffffff;
      border-radius: 14px;
      padding: 24px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      border-top: 3px solid ${accent};
      height:100%;

    ">

      <!-- Metric Row -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:${subtext ? '14px' : '0'};">
        <tr>
          <td valign="middle" style="
            font-size: 42px;
            font-weight: 500;
            color: ${accent};
            line-height: 1;
            padding-right: 12px;
            white-space: nowrap;
          ">
            ${value}
          </td>
          <td valign="middle" style="
            font-size: 16px;
            font-weight: 500;
            color: #444;
          ">
            ${label}
          </td>
        </tr>
      </table>

      <!-- Subtext -->
      ${subtext ? `
        <div style="
          background: #f1f3f4;
          border-radius: 8px;
          padding: 10px 12px;
          font-size: 12px;
          font-weight: 400;
          color: #666;
          line-height: 1.4;
        ">
          ${subtext}
        </div>
      ` : ''}

    </div>
  `;
}

function renderCardRow(cards, columns) {
  const width = Math.floor(100 / columns);

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:36px;">
      <tr>
        ${cards.map(card => `
          <td width="${width}%" valign="top" style="padding-right:24px;">
            <table width="100%" height="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="top" height="100%">
                  ${card}
                </td>
              </tr>
            </table>
          </td>
        `).join('')}
      </tr>
    </table>
  `;
}



function renderHeader(startDate,endDate){
  endDate.setDate(endDate.getDate() + 1);
  const dateRange = Utilities.formatDate(endDate, Session.getScriptTimeZone(), 'MMM d') +
                    ' – ' +
                    Utilities.formatDate(startDate, Session.getScriptTimeZone(), 'MMM d');


   return `
    <div style="
      font-family: 'Arial', sans-serif;
      margin-bottom: 36px;
      border-radius: 16px;
      padding: 32px 24px;
      background: #ffffff;
      box-shadow: 0 6px 20px rgba(0,0,0,0.08);
      border-left: 6px solid #1a73e8;
    ">
      <!-- Header -->
      <div style="display: flex; flex-direction: column; align-items: flex-start;">
        <h1 style="
          font-size: 22px;
          font-weight: 700;
          color: #1a73e8;
          margin: 0 0 12px 0;
        ">
          Hello Kyle, here is your habits report for ${dateRange}

        </h1>

      </div>
    </div>
  `;
}


function sendWeeklySummary() {
  const EMAIL_TO = 'kaeaston1@yahoo.com';
  const SHEET_NAME = 'Responses';
  const DAYS = 7;

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const idx = name => headers.indexOf(name);

  let bedtimes = []; // [day, wakeTime]
  let quietTimes = []; // count = quietTime.length()
  let screenTimes = []; // [hours, minutes, totalMinutes]
  let screenTimeStr = [];
  let screenRatings = [];
  let milesRun = 0;
  let longestRun = 0;
  let strength = [];
  let guitarMin = 0;
  let readingMin = 0;
  let meals = [];
  let breakfasts = [];
  let lunches = [];
  let dinners = [];
  let foodRatings = [];
  

  // send on sunday, include sunday-saturday data

  const start = new Date();
  start.setDate(start.getDate() - 1);
  const end = new Date();
  end.setDate(start.getDate() - DAYS);

  rows.forEach(rows => {
    const day = new Date(rows[idx('Day')]);
    // console.log(end instanceof Date)
    if (!(day instanceof Date) || day < end || day > start) return;

    // Get wake time stats
    bedtimes.push([rows[idx('Day')],rows[idx('Time Out of Bed')]]);

    // Get quiet time stats
    if (rows[idx('Quiet Time')]) {
      quietTimes.push(rows[idx('Quiet Time')]);
    }

    // Get screen time stats
    const screenTime = rows[idx('Yesterdays screen time H:MM')];
    const [hours, minutes] = screenTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const rating = rows[idx('Describe your phone use yesterday')];
    screenTimes.push([hours,minutes,totalMinutes]);
    screenRatings.push(rating);
    screenTimeStr.push(screenTime);

    // Get workout stats
    if (rows[idx('Miles Run')]){
    milesRun += rows[idx('Miles Run')];
      if (rows[idx('Miles Run')] > longestRun) {
        longestRun = rows[idx('Miles Run')];
      }
    }
    if (rows[idx('Strength')]) {
      strength.push(rows[idx('Strength')]);
    }

    // Get Food Stats
    breakfasts.push(rows[idx('What did you eat for breakfast?')]);
    lunches.push(rows[idx('What did you eat for lunch?')]);
    dinners.push(rows[idx('What did you eat for dinner?')]);
    meals.push([rows[idx('What did you eat for breakfast?')],rows[idx('What did you eat for lunch?')],rows[idx('What did you eat for dinner?')]]);
    foodRatings.push(rows[idx('Breakfast')]);
    foodRatings.push(rows[idx('Lunch')]);
    foodRatings.push(rows[idx('Dinner')]);


    // Get guitar and reading stats
    if (rows[idx('Guitar Minutes')]) {
      guitarMin += rows[idx('Guitar Minutes')];
    }
    if (rows[idx('Minutes Read')]) {
      readingMin += rows[idx('Minutes Read')];
    }
  });

  // Refine Food Stats
  let eatOut = 0;
  let eatOutFriends = 0;
  let eatOutPaid = 0;
  let eatOutLazy = 0;
  let badMeal = 0;

  foodRatings.forEach( r =>{
    switch (r) {
      case 'Good':
        break;
      case 'Small / Skipped':
        badMeal++;
        break;
      case 'Out - Lazy 👎🏻':
        eatOutLazy++;
        break;
      case 'Out - Someone else paid':
        eatOutPaid++;
        break;
      case 'Out - Date or with friends':
        eatOutFriends++;
        break;
    }
  });
  eatOut = eatOutFriends + eatOutPaid + eatOutLazy;

  // calculate average values
  const avgWakeTime = averageWakeTime(bedtimes);
  const avgScreen = averageScreenTime(screenTimes, screenRatings);
  const stdDevWake = stdDevWakeTimeMinutes(bedtimes);

const quietTimesCard = renderCard({
  value: quietTimes.length,
  label: 'Quiet Times this week',
  subtext: quietTimes.join(', ') || 'No quiet times logged',
  accent: '#4758b5'
});
const strengthCard = renderCard({
  value: strength.length,
  label: 'Strength workouts',
  subtext: strength.join(', ') || 'None logged',
  accent: '#34a853'
});
const milesCard = renderCard({
  value: milesRun,
  label: 'miles run this week',
  accent: '#fbbc05',
  subtext: `Longest: ${longestRun} mi`
});
const readingCard = renderCard({
  value: readingMin,
  label: 'minutes reading',
  accent: '#1a73e8'
});

const guitarCard = renderCard({
  value: guitarMin,
  label: 'minutes guitar',
  accent: '#137333'
});
const wakeCard = renderCard({
  value: avgWakeTime,
  label: 'avg wake up',
  accent: '#ef6229',
  subtext: `Std Dev: ${stdDevWake} min`
});

const screenTimeCard = renderCard({
  value: avgScreen['avgTime'],
  label: 'avg screen time',
  accent: '#FF3B30',
  subtext: screenTimeStr.join(', ')
});

const eatOutCard = renderCard({
  value: eatOut,
  label: 'meals ate out',
  accent: '#FFBC7F',
  subtext: `Lazy: ${eatOutLazy}<br>Friends/Date: ${eatOutFriends}<br>Didn't pay: ${eatOutPaid}`
});

const badMealsCard = renderCard({
  value: badMeal,
  label: 'Bad or skipped meals',
  accent: '#FF78CA'
});

const breakfastCard = renderMealCard({
  title: 'Breakfasts',
  accent: '#002d62',
  items: breakfasts
})

const lunchCard = renderMealCard({
  title: 'Lunches',
  accent: '#7248b9',
  items: lunches
})

const dinnerCard = renderMealCard({
  title: 'Dinners',
  accent: '#91603b',
  items: dinners
})

const screenRatingCard = renderCard({
  value: Math.round(avgScreen['avgRating'] * 10) / 10,
  label: 'avg screen time rate',
  accent: '#eec0c6'
});

const header = renderHeader(start, end);
const row1 = renderCardRow([quietTimesCard, screenTimeCard],2);
const row2 = renderCardRow([wakeCard,strengthCard,milesCard,],3);
const row3 = renderCardRow([(readingCard + guitarCard),eatOutCard, (screenRatingCard + badMealsCard)],3);
const row4 = renderCardRow([breakfastCard,lunchCard,dinnerCard],3);

  const html = `
    <div style="
      font-family: Arial, sans-serif;
      background: #b4ccd5;
      border-radius: 10px;
      padding: 36px;
      max-width: 900px;
      margin: 0 auto;
    ">      
      ${header}
      ${row1}
      ${row2}
      ${row3}
      ${row4}
      <!-- more sections will go here -->
    </div>
  `;


  MailApp.sendEmail({
    to: EMAIL_TO,
    cc: 'juliabeaird@yahoo.com',
    subject: 'Weekly Habit Report',
    htmlBody: html
  });
}


