const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DailyChallenge = require('../models/DailyChallenge');

const challenges = [
    {
        dayNumber: 1,
        title: "Factorial Calculator",
        slug: "factorial-calculator",
        description: "Write a program that calculates the factorial of a given number n.\nFactorial of n (n!) = n × (n-1) × (n-2) × ... × 1\nFor example: 5! = 5 × 4 × 3 × 2 × 1 = 120",
        difficulty: "Easy",
        date: new Date('2026-08-26'),
        inputFormat: "A single integer n (0 ≤ n ≤ 20)",
        outputFormat: "The factorial of n as a single integer",
        constraints: "0 ≤ n ≤ 20 (n! fits in a 64-bit integer)",
        examples: "Input: 5\nOutput: 120\n\nInput: 3\nOutput: 6",
        allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
        points: 10,
        // VISIBLE test cases (shown to students)
        visibleTestCases: [
            { input: "5\n", output: "120\n", isHidden: false },
            { input: "3\n", output: "6\n", isHidden: false },
            { input: "0\n", output: "1\n", isHidden: false }
        ],
        // HIDDEN test cases (not shown to students)
        hiddenTestCases: [
            { input: "10\n", output: "3628800\n", isHidden: true },
            { input: "7\n", output: "5040\n", isHidden: true },
            { input: "1\n", output: "1\n", isHidden: true },
            { input: "20\n", output: "2432902008176640000\n", isHidden: true }
        ]
    },
    {
        dayNumber: 2,
        title: "Sum of Two Numbers",
        slug: "sum-of-two-numbers",
        description: "Write a program that takes two integers as input and returns their sum.",
        difficulty: "Easy",
        date: new Date('2026-08-27'),
        inputFormat: "Two space-separated integers a and b",
        outputFormat: "The sum of a and b",
        constraints: "-10^9 ≤ a, b ≤ 10^9",
        examples: "Input: 5 7\nOutput: 12",
        allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
        points: 10,
        visibleTestCases: [
            { input: "5 7\n", output: "12\n", isHidden: false },
            { input: "10 20\n", output: "30\n", isHidden: false },
            { input: "-5 7\n", output: "2\n", isHidden: false }
        ],
        hiddenTestCases: [
            { input: "1000000000 2000000000\n", output: "3000000000\n", isHidden: true },
            { input: "-10 -20\n", output: "-30\n", isHidden: true },
            { input: "0 0\n", output: "0\n", isHidden: true }
        ]
    },
    {
        dayNumber: 3,
        title: "Check Prime Number",
        slug: "check-prime-number",
        description: "Write a program that checks if a given number is prime.\nA prime number is a number greater than 1 that has no positive divisors other than 1 and itself.",
        difficulty: "Medium",
        date: new Date('2026-08-28'),
        inputFormat: "A single integer n",
        outputFormat: "Print 'Prime' if n is prime, otherwise 'Not Prime'",
        constraints: "1 ≤ n ≤ 10^6",
        examples: "Input: 7\nOutput: Prime",
        allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
        points: 15,
        visibleTestCases: [
            { input: "7\n", output: "Prime\n", isHidden: false },
            { input: "10\n", output: "Not Prime\n", isHidden: false },
            { input: "2\n", output: "Prime\n", isHidden: false }
        ],
        hiddenTestCases: [
            { input: "97\n", output: "Prime\n", isHidden: true },
            { input: "100\n", output: "Not Prime\n", isHidden: true },
            { input: "1\n", output: "Not Prime\n", isHidden: true },
            { input: "9973\n", output: "Prime\n", isHidden: true }
        ]
    },
    {
        dayNumber: 4,
        title: "Reverse a String",
        slug: "reverse-a-string",
        description: "Write a program that reverses a given string.",
        difficulty: "Easy",
        date: new Date('2026-08-29'),
        inputFormat: "A single line containing a string s",
        outputFormat: "The reversed string",
        constraints: "1 ≤ |s| ≤ 1000",
        examples: "Input: hello\nOutput: olleh",
        allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
        points: 10,
        visibleTestCases: [
            { input: "hello\n", output: "olleh\n", isHidden: false },
            { input: "world\n", output: "dlrow\n", isHidden: false },
            { input: "a\n", output: "a\n", isHidden: false }
        ],
        hiddenTestCases: [
            { input: "racecar\n", output: "racecar\n", isHidden: true },
            { input: "hello world\n", output: "dlrow olleh\n", isHidden: true },
            { input: "12345\n", output: "54321\n", isHidden: true }
        ]
    },
    {
        dayNumber: 5,
        title: "Fibonacci Sequence",
        slug: "fibonacci-sequence",
        description: "Write a program that prints the nth Fibonacci number.\nThe Fibonacci sequence is: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, ...\nF(0) = 0, F(1) = 1, F(n) = F(n-1) + F(n-2)",
        difficulty: "Medium",
        date: new Date('2026-08-30'),
        inputFormat: "A single integer n",
        outputFormat: "The nth Fibonacci number",
        constraints: "0 ≤ n ≤ 30",
        examples: "Input: 10\nOutput: 55",
        allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
        points: 15,
        visibleTestCases: [
            { input: "10\n", output: "55\n", isHidden: false },
            { input: "5\n", output: "5\n", isHidden: false },
            { input: "0\n", output: "0\n", isHidden: false }
        ],
        hiddenTestCases: [
            { input: "1\n", output: "1\n", isHidden: true },
            { input: "20\n", output: "6765\n", isHidden: true },
            { input: "7\n", output: "13\n", isHidden: true },
            { input: "15\n", output: "610\n", isHidden: true }
        ]
    },
    {
        dayNumber: 6,
        title: "Palindrome Check",
        slug: "palindrome-check",
        description: "Write a program that checks if a given string is a palindrome (reads the same forwards and backwards).\nIgnore case and spaces for this check.",
        difficulty: "Easy",
        date: new Date('2026-08-31'),
        inputFormat: "A single line containing a string s",
        outputFormat: "Print 'Palindrome' if s is a palindrome, otherwise 'Not Palindrome'",
        constraints: "1 ≤ |s| ≤ 1000",
        examples: "Input: racecar\nOutput: Palindrome",
        allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
        points: 10,
        visibleTestCases: [
            { input: "racecar\n", output: "Palindrome\n", isHidden: false },
            { input: "hello\n", output: "Not Palindrome\n", isHidden: false },
            { input: "a\n", output: "Palindrome\n", isHidden: false }
        ],
        hiddenTestCases: [
            { input: "madam\n", output: "Palindrome\n", isHidden: true },
            { input: "A man a plan a canal Panama\n", output: "Not Palindrome\n", isHidden: true },
            { input: "never odd or even\n", output: "Not Palindrome\n", isHidden: true },
            { input: "12321\n", output: "Palindrome\n", isHidden: true }
        ]
    },
    {
        dayNumber: 7,
        title: "Find Maximum in Array",
        slug: "find-maximum-in-array",
        description: "Write a program that finds the maximum element in an array.",
        difficulty: "Easy",
        date: new Date('2026-09-01'),
        inputFormat: "First line: n (size of array)\nSecond line: n space-separated integers",
        outputFormat: "The maximum element",
        constraints: "1 ≤ n ≤ 10^5",
        examples: "Input: 5\n1 2 3 4 5\nOutput: 5",
        allowedLanguages: ['cpp', 'python', 'java', 'javascript'],
        points: 10,
        visibleTestCases: [
            { input: "5\n1 2 3 4 5\n", output: "5\n", isHidden: false },
            { input: "3\n10 20 5\n", output: "20\n", isHidden: false },
            { input: "1\n42\n", output: "42\n", isHidden: false }
        ],
        hiddenTestCases: [
            { input: "6\n-5 -2 -1 -10 -3 -7\n", output: "-1\n", isHidden: true },
            { input: "4\n100 200 150 300\n", output: "300\n", isHidden: true },
            { input: "2\n-10 -20\n", output: "-10\n", isHidden: true }
        ]
    }
];

async function seedChallenges() {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error('❌ MONGODB_URI not found in .env file');
            console.error('Please create a .env file in the backend root with:');
            console.error('MONGODB_URI=mongodb://localhost:27017/stcc');
            process.exit(1);
        }

        console.log('📦 Connecting to MongoDB...');
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // Clear existing challenges
        const deleted = await DailyChallenge.deleteMany({});
        console.log(`🗑️ Cleared ${deleted.deletedCount} existing challenges`);

        // Insert new challenges
        const result = await DailyChallenge.insertMany(challenges);
        console.log(`✅ Seeded ${result.length} challenges`);

        console.log('\n📋 Challenge List:');
        console.log('━'.repeat(70));
        result.forEach(c => {
            const totalTests = (c.visibleTestCases?.length || 0) + (c.hiddenTestCases?.length || 0);
            console.log(`   Day ${c.dayNumber.toString().padStart(2)}: ${c.title.padEnd(30)} ${c.difficulty.padEnd(8)} ${c.points} pts (${totalTests} tests)`);
        });
        console.log('━'.repeat(70));

        console.log('\n🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error.message);
        if (error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
}

seedChallenges();