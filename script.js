"use strict";

// BANKIST APP

// Data

/**
 * @typedef {Object} Account
 * @property {string} owner
 * @property {number[]} movements
 * @property {number} interestRate
 * @property {number} pin
 * @property {string} [username]
 * @property {number} [balance]
 */

const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const welcomeMessage = document.querySelector("#login-title");
const labelDate = document.querySelector("#balance-date") ?? {};
const labelBalance = document.querySelector("#current-balance-number");
const labelSumIn = document.querySelector("#total-deposit");
const labelSumOut = document.querySelector("#total-withdrawal");
const labelSumInterest = document.querySelector("#total-interest");
const labelTimer = document.querySelector("#timer");

const containerMain = document.querySelector("#content");
const containerMovements = document.querySelector("#movements-container");

const btnLogin = document.querySelector(".login-btn");
const btnTransfer = document.querySelector("#transfer-btn");
const btnLoan = document.querySelector("#request-loan-btn");
const btnCloseAccount = document.querySelector("#close-account-btn");
const btnSort = document.querySelector("#sort-btn");

const inputLoginUsername = document.querySelector("#user-login-input");
const inputLoginPin = document.querySelector("#pin-login-input");
const inputTransferTo = document.querySelector("#transfer-to-input");
const inputTransferAmount = document.querySelector("#transfer-amount-input");
const inputLoanAmount = document.querySelector("#request-loan-input");
const inputCloseUsername = document.querySelector("#close-user-input");
const inputClosePin = document.querySelector("#close-pin-input");

// GLOBAL VARIABLES

let nTimer;
const nSeconds = 300;
let bIsRunning = false;
const sDateToday = (labelDate.textContent = new Date().toLocaleDateString());
let bSort = false;
//FIXME: Sea crea la variable global para ser definida en la siguiente funcion y
// usada despues en la funcion TransferMoney
let oCurrentAccountLogged;

// MAKING WEB INTERACTIVE

// CREATING USERNAMES
/**
 *
 * @param {Account[]} aAccounts
 * @returns A string of the first letter of user's first and last names in lower case
 */
function fCreateUsernames(aAccounts) {
  return aAccounts.forEach(
    (oAccount) =>
      (oAccount.username = // Creando la nueva propiedad userName
        // y asignandola a todas las cuentas.
        oAccount.owner // Elimina el array para extraer solo el texto
          .toLowerCase() // Se convierte todo el texto a minusculas
          .split(" ") // Se separa todo el texto cada que encuentra un espacio vacio y encierra
          // el resultado en un array
          .map((sWord) => {
            return sWord.substring(0, 1);
          }) // Por cada palabra de las palabras que tengo ahora,
          // regresame la primera letra de cada palabra
          .join(""))
  ); // Elimina el array de las palabras y une todo el texto como uno solo
}
fCreateUsernames(accounts);

// LOGIN SECTION
/**
 * @param {Account[]} accounts
 * @returns Creates all usernames, if true, it displays a welcome message, it clears all inputs, it makes main container visible, updates UI,
 *  restarts timer, creates currentAccountLogged variable and replaces labelDate with the current date of user's device.
 */
function fCheckLogin(aAccounts) {
  if (
    inputLoginPin === null ||
    inputLoginUsername === null ||
    inputLoginPin.value === "" ||
    inputLoginUsername.value === ""
  ) {
    return alert("Insert your login credentials");
  }
  // FIXME: Anote la propiedad username con N mayuscula lo que provocaba parte del error
  let oCurrentAccount = aAccounts.find(
    (oAccount) => oAccount.username === inputLoginUsername.value
  );

  // FIXME: Esta linea se podria usar para cuando se manejen multiples usuarios con la posibilidad de que el username se repita
  // let currentAccountIndex = accounts.findIndex(account => account.username === inputLoginUsername.value) // 0 - n || -1
  // console.log('accounts index',accounts[currentAccountIndex])

  if (oCurrentAccount === undefined) {
    return alert("Your account doesn't exist");
  }

  if (oCurrentAccount.pin !== +inputLoginPin.value) {
    return alert("Wrong Login Credentials");
  } else {
    fClearInputs();
    btnLogin.blur();
    welcomeMessage.textContent = `Welcome Back ${oCurrentAccount.owner}`;
    containerMain.style.opacity = 1;
    // UPDATING UI
    fUpdateUI(oCurrentAccount);
    // FIXME: Aqui se define la variable con los datos de la cuenta que se acaba de loggear
    fRestartTimer();
    oCurrentAccountLogged = oCurrentAccount;
    labelDate.textContent = sDateToday;
  }
}

// CALCULATING BALANCE
/**
 * @param {Account} oAccount
 * @returns It first makes sure that the movements of the current account logged in is true, then
 * calculates the balance of the current user logged in and replaces labelBalance with the total amount.
 */
function fCalcUserBalances(oAccount) {
  accounts.forEach((oAccount) => {
    // Se comprueba que account.movements sea un array antes de usar reduce. Esto previene errores
    // al intentar acceder a propiedades de una cuenta que no exista o no tenga movimientos.
    if (!oAccount || !Array.isArray(oAccount.movements)) {
      // Si la cuenta es undefined, simplemente omite esta iteración
      return;
    }
    // Calcula el balance total solo si la cuenta es válida
    oAccount.balance = oAccount.movements.reduce((acc, mov) => acc + mov, 0);
  });
  const aUserBalance = accounts.find(
    (a) => a.owner === oAccount.owner && a.pin === oAccount.pin
  );

  // DISPLAYING CURRENT BALANCE
  labelBalance.textContent = `${aUserBalance?.balance}€`;
}

// CALCULATING SUMMARY
/**
 * @param {Account} oAccount  - The account object which contains the movements array and other account data.
 * @returns Current account's total deposits, total withdrawals & total interest that
 * it's generating according to how much balance they currently have and replaces summary
 * section's label with that info.
 */
function fCalcSummary(oAccount) {
  const totalIn = oAccount.movements
    .filter((mov) => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  const totalOut = oAccount.movements
    .filter((mov) => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);

  const totalInterest = oAccount.balance * (oAccount.interestRate / 365);
  // DISPLAYING SUMMARY
  labelSumIn.textContent = `${totalIn}€`;
  labelSumOut.textContent = `${totalOut}€`;
  labelSumInterest.textContent = `${totalInterest.toFixed(2)}€`;
}

/**
 * @param {number[]} aMovements - The account object which contains the movements array and other account data.
 * @returns First it empties all current html elements inside of containerMovements,
 * then it creates a variable: if movements > 0 then it's deposit, otherwise is withdrawal
 * and according to that it manipulates dom so this function displays all current account's
 * movements after containerMovements begin.
 */
const fDisplayMovements = function (aMovements) {
  containerMovements.innerHTML = "";
  aMovements.forEach((nMovement, i) => {
    const sType = nMovement > 0 ? "deposit" : "withdrawal";

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${sType}">
      ${i + 1} ${sType}</div>
      <div class="movements__date">${sDateToday}</div>
      <div class="movements__value">${nMovement}€</div>
    </div>
    `;
    containerMovements?.insertAdjacentHTML("afterbegin", html);
  });
};

/**
 * @param {Account} oAccount
 * @returns It uses the following functions: calcUserBalances,
 * displayMovements, calcSummary & startTimer
 */
function fUpdateUI(oAccount) {
  fCalcUserBalances(oAccount);
  fDisplayMovements(oAccount.movements);
  fCalcSummary(oAccount);
  startTimer(nSeconds);
}

// Starting Logout Timer

/**
 * @param {number} nSeconds
 * @returns A stopwatch. As soon as seconds reaches out 0, it stops.
 */
function startTimer(nSeconds) {
  if (!bIsRunning) {
    bIsRunning = true;
    nTimer = setInterval(() => {
      if (nSeconds > 0) {
        labelTimer.textContent = fFormatTime(nSeconds--);
      } else {
        fStopTimer();
        fLogOutUser();
      }
    }, 1000);
  }
}

/**
 * @description Kills stopwatch
 */
function fStopTimer() {
  bIsRunning = false;
  clearInterval(nTimer);
}

/**
 * @returns Uses the functions stopTimer & startTimer
 */
function fRestartTimer() {
  fStopTimer();
  startTimer(nSeconds);
}

/**
 *
 * @param {number} nSecs
 * @returns String of minutes & seconds on regular time format
 */
function fFormatTime(nSecs) {
  const nMinutes = String(Math.floor((nSecs % 3600) / 60)).padStart(2, "0");
  const nSeconds = String(nSecs % 60).padStart(2, "0");
  return `${nMinutes}:${nSeconds}`;
}

/**
 * @description Hides containerMain, uses clearInputs & stopTimer functions
 * & it gets back the default login message
 */
function fLogOutUser() {
  containerMain.style.opacity = 0;
  welcomeMessage.textContent = "Log in to get started";
  fClearInputs();
  fStopTimer();
}

// USER TRANSFERS MONEY

/**
 * Handles the process of transferring money from the logged-in user's account to another user.
 * Validates the input, checks if the transfer is valid, and updates the UI.
 *
 * @returns {void}
 */
function fTransferMoney() {
  // FIXME: Elimine esta linea porque me parecio innecesaria y
  // La reemplaze con la variable currentAccountLogged ya existente
  // const account = currentAccountLogged
  const nTransferAmount = +inputTransferAmount.value;
  // FIXME: Si transferAmount es falso o si esta intentando "transferir"
  // un numero negativo, lanzar una alerta y terminar la funcion aqui.
  if (!nTransferAmount || nTransferAmount < 1) {
    return alert("Please make sure you're using a valid amount");
  }

  if (oCurrentAccountLogged.username === inputTransferTo.value) {
    console.log(nTransferAmount);
    return alert("You can't transfer to yourself!");
  }

  // console.log({transferAmount, balance: currentAccountLogged.balance });

  if (nTransferAmount > oCurrentAccountLogged.balance) {
    return alert("There's not enough funds to make this transfer");
  }

  const oReceiver = accounts.find(
    (acct) => acct.username === inputTransferTo.value
  );

  if (oReceiver === undefined) {
    return alert("User doesn't exist");
  }
  btnTransfer.blur();

  // Add negative movement to current user
  oCurrentAccountLogged.movements.push(-nTransferAmount);
  oCurrentAccountLogged.balance -= nTransferAmount;

  // Add positive movement to recipient
  oReceiver.balance += nTransferAmount;
  oReceiver.movements.push(nTransferAmount);

  fUpdateUI(oCurrentAccountLogged);
  fClearInputs();
  alert("Transfer Successful!");
}

// User Requests Loan

/**
 * Handles the process of requesting a loan.
 * Validates if the user is eligible by checking if at least one of their deposits
 * is greater than or equal to 10% of the requested loan amount.
 *
 * @returns {void}
 */
function fRequestLoan() {
  const nLoanAmount = +inputLoanAmount.value;
  if (!nLoanAmount) {
    return alert("Insert a valid number");
  }
  const bIsEligible = oCurrentAccountLogged.movements.some(
    (nDeposit) => nDeposit >= nLoanAmount * 0.1
  );
  if (bIsEligible) {
    console.log(nLoanAmount);
    return alert(
      "You're not eligible for a loan. Improve your credit score and comeback later"
    );
  }
  if (!bIsEligible) {
    btnLoan.blur();
    oCurrentAccountLogged.balance += nLoanAmount;
    oCurrentAccountLogged.movements.push(nLoanAmount);
    fUpdateUI(oCurrentAccountLogged);
    fClearInputs();
    alert("🎉 You're eligible to receive the loan, congrats! 🎉");
  }
}

// User Closes Account
/**
 * Handles the process of closing the user's account.
 * Validates the credentials and, if successful, deletes the account data.
 *
 * @returns {void}
 */
function fCloseAccount() {
  if (
    inputCloseUsername.value !== oCurrentAccountLogged.username ||
    Number(inputClosePin.value) !== oCurrentAccountLogged.pin
  ) {
    return alert("Invalid Credentials");
  } else {
    btnCloseAccount.blur();
    fLogOutUser();
    alert("Your Account Was Deleted!");
    return Object.keys(oCurrentAccountLogged).forEach(
      (key) => delete oCurrentAccountLogged[key]
    );
  }
}

/**
 * Clears all the input fields for login, transfer, loan, and account closure forms.
 *
 * @returns {void}
 */
function fClearInputs() {
  inputLoginUsername.value = "";
  inputLoginPin.value = "";
  inputTransferTo.value = "";
  inputTransferAmount.value = "";
  inputLoanAmount.value = "";
  inputClosePin.value = "";
  inputCloseUsername.value = "";
  inputLoginUsername.blur();
  inputLoginPin.blur();
  inputTransferTo.blur();
  inputTransferAmount.blur();
  inputLoanAmount.blur();
  inputClosePin.blur();
  inputCloseUsername.blur();
}

/**
 * Toggles the sorting of account movements. It sorts the movements either in ascending or
 * descending order and updates the UI.
 *
 * @returns {void}
 */
function fSortMovements() {
  bSort = !bSort; // EL valor de Sort sera igual al contrario del valor de sort en ese momento
  if (!bSort) {
    oCurrentAccountLogged.movements.sort((a, b) => a - b);
    btnSort.textContent = "↑ SORT";
    return fDisplayMovements(oCurrentAccountLogged.movements);
  } else {
    oCurrentAccountLogged.movements.sort((a, b) => b - a);
    btnSort.textContent = "↓ SORT";
    return fDisplayMovements(oCurrentAccountLogged.movements);
  }
}

// EVENT LISTENERS
btnLogin?.addEventListener("click", () => fCheckLogin(accounts));

// FIXME: Tener esto dentro de checklogin hacia que la funcion transferMoney se
// ejecutara cada vez que el usuario se loggeaba lo que provocaba errores sin sentido
btnTransfer?.addEventListener("click", () => fTransferMoney());

btnLoan?.addEventListener("click", () => fRequestLoan());
btnCloseAccount?.addEventListener("click", () => fCloseAccount());
btnSort?.addEventListener("click", fSortMovements);
