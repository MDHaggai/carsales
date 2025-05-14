export const calculateMonthlyPayment = (loanAmount, annualInterestRate, loanTerm) => {
    const monthlyInterestRate = annualInterestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    return (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
};

export const calculateTotalPayment = (monthlyPayment, loanTerm) => {
    return monthlyPayment * loanTerm * 12;
};

export const calculateTotalInterest = (totalPayment, loanAmount) => {
    return totalPayment - loanAmount;
};

export const generateAmortizationSchedule = (loanAmount, annualInterestRate, loanTerm) => {
    const monthlyPayment = calculateMonthlyPayment(loanAmount, annualInterestRate, loanTerm);
    const monthlyInterestRate = annualInterestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const schedule = [];

    let balance = loanAmount;

    for (let i = 1; i <= numberOfPayments; i++) {
        const interestPayment = balance * monthlyInterestRate;
        const principalPayment = monthlyPayment - interestPayment;
        balance -= principalPayment;

        schedule.push({
            paymentNumber: i,
            interestPayment: interestPayment.toFixed(2),
            principalPayment: principalPayment.toFixed(2),
            remainingBalance: balance < 0 ? 0 : balance.toFixed(2),
        });
    }

    return schedule;
};