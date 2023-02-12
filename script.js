'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2022-02-13T10:51:36.790Z',
    '2022-02-15T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// let timer, countdown;

/////////////////////////////////////////////////

const formatCurrency = (amount, locale, currency) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);

// Functions
const formatMovementDate = function (date, currentAccount) {
  const calcDaysPast = (date1, date2) =>
    Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
  const daysDifference = calcDaysPast(new Date(), date);
  if (daysDifference === 0) return 'Today';
  if (daysDifference === 1) return 'Yesterday';
  if (daysDifference <= 7) return `${daysDifference} days ago`;
  const options = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };
  return new Intl.DateTimeFormat(currentAccount.locale, options).format(date);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    const formattedCurrency = formatCurrency(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${formatMovementDate(date, acc)}</div>
        <div class="movements__value">${formattedCurrency}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(out, acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startCountdownTimer = () => {
  let timer = 300;
  const tick = () => {
    let minutes = String(Math.trunc(timer / 60)).padStart(2, '0');
    let seconds = String(timer % 60).padStart(2, '0');
    labelTimer.textContent = `${minutes}:${seconds}`;
    if (timer == 0) {
      clearInterval(countdown);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = 'Log in to get started';
    }
    timer--;
  };
  tick();
  countdown = setInterval(tick, 1000);
};

///////////////////////////////////////
// Event handlers
let currentAccount, countdown;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  if (countdown) clearInterval(countdown);

  startCountdownTimer();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      weekday: 'long',
    };
    const currentDate = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(new Date());
    labelDate.textContent = currentDate;
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  clearInterval(countdown);

  startCountdownTimer();

  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Adding the dates
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  clearInterval(countdown);

  startCountdownTimer();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    setTimeout(function () {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

//  Converting numbers
// console.log(Number('23'));
// console.log(+'23');

// //  Parsing Numbers
// console.log(parseInt('44px'));
// console.log(parseInt('a55x2'));
// console.log(parseFloat('22.5rem'));

// // Checking if something is a number
// console.log(Number.isNaN(22));
// console.log(Number.isNaN(+'23a'));
// console.log(Number.isNaN(22 / 0));

// // Better version

// console.log(Number.isFinite(22));
// console.log(Number.isFinite(+'22'));
// console.log(Number.isFinite(22 / 0));
// console.log(Number.isInteger(22));

// //  Math Object
// console.log(Math.sqrt(16));
// console.log(27 ** (1 / 3));
// console.log(Math.max(2, 5, 22, 11, 4, -2));
// console.log(Math.max(...[2, 5, 22, 11, 4, -2]));
// console.log(Math.min(2, 5, 22, 11, 4, -2));
// console.log(Math.trunc(Math.random() * 6) + 1);

// const generateRandomNumber = function (min, max) {
//   return Math.trunc(Math.random() * (max - min + 1)) + min;
// };

// console.log(generateRandomNumber(10, 20));

// console.log(Math.PI);

// console.log(Math.round(22.5));
// console.log(Math.round(22.1));
// console.log(Math.round(22.9));

// console.log(Math.trunc(22.5));
// console.log(Math.trunc(22.1));
// console.log(Math.trunc(22.9));

// console.log('===============');

// console.log(Math.ceil(22.5));
// console.log(Math.ceil(22.1));
// console.log(Math.ceil(22.9));

// console.log('===============');

// console.log(Math.floor(22.5));
// console.log(Math.floor(22.1));
// console.log(Math.floor(22.9));
// console.log((22.543).toFixed(7));

// const isEven = n => n % 2 === 0;
// console.log(isEven(5));
// console.log(isEven(12));
// console.log(isEven(143));

// labelBalance.addEventListener('click', () => {
//   const rowsArray = Array.from(document.querySelectorAll('.movements__row'));
//   rowsArray.forEach((row, i) => {
//     if (i % 2 === 0) row.style.backgroundColor = 'blue';
//     if (i % 3 === 0) row.style.backgroundColor = 'red';
//   });
// });

//  DATE

// console.log(new Date());
// console.log(new Date('7 may 1989'));
// console.log(new Date(2037, 10, 19, 15, 28, 5));
// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));
// const futureDate = new Date(2037, 10, 19, 15, 28);
// console.log(futureDate.getFullYear());
// console.log(futureDate.getMonth());
// console.log(futureDate.getDate());
// console.log(futureDate.getDay());
// console.log(futureDate.getTime());
// console.log(new Date(2142250080000));
// console.log(Date.now());
// console.log(futureDate.toISOString());

// const future = new Date(2037, 4, 7, 19, 20, 30);
// console.log(Number(future));

// const calcDaysPast = (date1, date2) =>
//   Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));
// const days1 = calcDaysPast(
//   new Date(2037, 4, 7, 10, 12, 44),
//   new Date(2037, 4, 17)
// );
// console.log(days1);
//  Date internationalization API

// const options = {
//   hour: 'numeric',
//   minute: 'numeric',
//   second: 'numeric',
//   day: 'numeric',
//   month: 'numeric',
//   year: 'numeric',
//   weekday: 'long',
// };

// const locale = navigator.language;
// console.log(locale);

// console.log(new Intl.DateTimeFormat(locale, options).format(new Date()));

// const number = 1234562.52;
// const options = {
//   style: 'currency',
//   currency: 'RON',
// };

// console.log('US', new Intl.NumberFormat('en-US', options).format(number));
// console.log('Romania', new Intl.NumberFormat('ro-RO', options).format(number));

// SET TIMEOUT

// const ingredientePizza = ['salam', 'muraturi'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Your pizza with ${ing1} and ${ing2} is here!`),
//   3000,
//   ...ingredientePizza
// );
// console.log('Waiting for that pizza');
// if (ingredientePizza.some(ing => ing === 'carnati')) clearTimeout(pizzaTimer);

// SET INTERVAL

// setInterval(
//   arg => {
//     const date = new Date();
//     const theTime = Intl.DateTimeFormat('ro-RO', {
//       hour: 'numeric',
//       second: 'numeric',
//       minute: 'numeric',
//     }).format(date);
//     document.querySelector('.welcome').textContent = `${theTime} ${arg}`;
//   },
//   1000,
//   'bomba'
// );
