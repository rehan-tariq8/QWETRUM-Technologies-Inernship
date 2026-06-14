/**
 * data.js — QuizMaster Question Bank & Static Data
 * All quiz content lives here; no business logic.
 */

'use strict';

/* ─────────────────────────────────────────────────────────────
   CATEGORY METADATA
   ──────────────────────────────────────────────────────────── */
const CATEGORIES = [
  {
    key:   'HTML',
    label: 'HTML',
    icon:  '🌐',
    color: '#e34c26',
    bg:    '#fff0ec',
    desc:  'Web structure & semantics',
  },
  {
    key:   'JavaScript',
    label: 'JavaScript',
    icon:  '⚡',
    color: '#b8940a',
    bg:    '#fffce6',
    desc:  'The language of the web',
  },
  {
    key:   'React',
    label: 'React',
    icon:  '⚛️',
    color: '#00b2d9',
    bg:    '#e8faff',
    desc:  'UI library & hooks',
  },
  {
    key:   'Cpp',
    label: 'C++',
    icon:  '⚙️',
    color: '#00599c',
    bg:    '#e8f0fa',
    desc:  'Systems programming',
  },
  {
    key:   'Python',
    label: 'Python',
    icon:  '🐍',
    color: '#3776ab',
    bg:    '#e8f4ff',
    desc:  'Readable & versatile',
  },
];

/* ─────────────────────────────────────────────────────────────
   QUESTION BANK
   Each entry: { q: string, opts: string[4], ans: 0-3 }
   ──────────────────────────────────────────────────────────── */
const QUESTION_BANK = {

  HTML: [
    { q: 'Who is making the Web standards?',
      opts: ['The World Wide Web Consortium', 'Microsoft', 'Mozilla', 'Google'], ans: 0 },
    { q: 'Which HTML element is used to define a footer for a document or section?',
      opts: ['<bottom>', '<section>', '<footer>', '<article>'], ans: 2 },
    { q: 'What does HTML stand for?',
      opts: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Transfer Markup Layer', 'Hyper Tool Markup Language'], ans: 0 },
    { q: 'Which attribute provides a unique identifier for an HTML element?',
      opts: ['class', 'id', 'name', 'key'], ans: 1 },
    { q: 'Which HTML tag is used to define an internal style sheet?',
      opts: ['<script>', '<style>', '<css>', '<link>'], ans: 1 },
    { q: 'What is the correct HTML element for the largest heading?',
      opts: ['<h6>', '<heading>', '<head>', '<h1>'], ans: 3 },
    { q: 'Which HTML attribute specifies alternate text for an image if it cannot be displayed?',
      opts: ['title', 'alt', 'src', 'longdesc'], ans: 1 },
    { q: 'How do you create a hyperlink in HTML?',
      opts: ["<a url='…'>", "<link href='…'>", "<a href='…'>", '<url>…</url>'], ans: 2 },
    { q: 'Which HTML element defines navigation links?',
      opts: ['<navigate>', '<nav>', '<link>', '<menu>'], ans: 1 },
    { q: 'What does the <canvas> element in HTML5 do?',
      opts: ['Embeds a video', 'Draws graphics via scripting', 'Displays a table', 'Creates a form'], ans: 1 },
    { q: 'Which input type is used for a date picker in HTML5?',
      opts: ['text', 'calendar', 'date', 'datetime'], ans: 2 },
    { q: 'Which tag is used to group inline elements for styling?',
      opts: ['<div>', '<section>', '<span>', '<group>'], ans: 2 },
  ],

  JavaScript: [
    { q: 'Which company originally developed JavaScript?',
      opts: ['Microsoft', 'Mozilla', 'Netscape', 'Apple'], ans: 2 },
    { q: "What is the correct syntax to print 'Hello' to the browser console?",
      opts: ["print('Hello')", "console.log('Hello')", "echo('Hello')", "log.console('Hello')"], ans: 1 },
    { q: 'Which keyword declares a block-scoped variable in modern JavaScript?',
      opts: ['var', 'let', 'define', 'local'], ans: 1 },
    { q: "What does '===' check in JavaScript?",
      opts: ['Value only', 'Type only', 'Value and type', 'Neither value nor type'], ans: 2 },
    { q: 'Which method converts a JSON string to a JavaScript object?',
      opts: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'JSON.toObject()'], ans: 1 },
    { q: "What does 'typeof null' return in JavaScript?",
      opts: ['null', 'undefined', 'object', 'boolean'], ans: 2 },
    { q: 'Which array method adds one or more elements to the end of an array?',
      opts: ['push()', 'pop()', 'shift()', 'unshift()'], ans: 0 },
    { q: 'What is a closure in JavaScript?',
      opts: ['A loop construct', 'A function with access to its outer lexical scope', 'An error handler', 'A CSS selector utility'], ans: 1 },
    { q: 'Which keyword stops a loop iteration early and jumps to the next one?',
      opts: ['stop', 'exit', 'continue', 'return'], ans: 2 },
    { q: "What does 'NaN' stand for?",
      opts: ['Not a Null', 'Not a Number', 'Null and None', 'New and Null'], ans: 1 },
    { q: "Which method removes the last element from an array and returns it?",
      opts: ['push()', 'pop()', 'slice()', 'splice()'], ans: 1 },
    { q: 'What will `0.1 + 0.2 === 0.3` evaluate to in JavaScript?',
      opts: ['true', 'false', 'undefined', 'NaN'], ans: 1 },
  ],

  React: [
    { q: 'What is JSX?',
      opts: ['A database query language', 'JavaScript XML syntax extension', 'A CSS-in-JS framework', 'A back-end templating library'], ans: 1 },
    { q: 'Which Hook is used for managing state in functional components?',
      opts: ['useEffect', 'useContext', 'useState', 'useReducer'], ans: 2 },
    { q: 'Which method triggers a re-render in a React class component?',
      opts: ['this.render()', 'this.setState()', 'this.update()', 'this.forceUpdate()'], ans: 1 },
    { q: 'What does the Virtual DOM accomplish in React?',
      opts: ['Renders HTML directly to disk', 'Minimises costly real DOM operations', 'Handles network requests', 'Manages client-side routing'], ans: 1 },
    { q: 'What is the primary purpose of useEffect?',
      opts: ['To define component state', 'To handle side effects after render', 'To apply CSS styles', 'To pass props between components'], ans: 1 },
    { q: 'What is a React key used for in lists?',
      opts: ['Styling list items uniquely', 'Identifying list items for efficient reconciliation', 'Passing data to child components', 'Triggering manual re-renders'], ans: 1 },
    { q: 'Which React API creates a new element?',
      opts: ['React.make()', 'React.element()', 'React.createElement()', 'React.build()'], ans: 2 },
    { q: 'What are props in React?',
      opts: ['Internal mutable state', 'Read-only inputs passed into a component', 'Inline CSS style objects', 'Event listener references'], ans: 1 },
    { q: 'What is the default development server port for Create React App?',
      opts: ['8080', '3000', '5000', '4200'], ans: 1 },
    { q: 'Which Hook best replaces componentDidMount in a functional component?',
      opts: ['useState', 'useContext', 'useEffect with empty deps []', 'useRef'], ans: 2 },
    { q: 'What does React.memo do?',
      opts: ['Memoizes a value', 'Prevents unnecessary re-renders of functional components', 'Caches API responses', 'Manages global state'], ans: 1 },
    { q: 'Which hook lets you access the DOM directly in React?',
      opts: ['useState', 'useContext', 'useRef', 'useMemo'], ans: 2 },
  ],

  Cpp: [
    { q: 'Which symbol begins a single-line comment in C++?',
      opts: ['#', '//', '/*', '--'], ans: 1 },
    { q: 'What is the correct way to declare a pointer to an integer in C++?',
      opts: ['int &p;', 'int *p;', 'int p*;', 'pointer int p;'], ans: 1 },
    { q: 'Which operator allocates memory dynamically on the heap in C++?',
      opts: ['malloc', 'alloc', 'new', 'create'], ans: 2 },
    { q: 'What is the output of `cout << 5 / 2;` in C++ (integer division)?',
      opts: ['2.5', '2', '3', 'Compile error'], ans: 1 },
    { q: 'Which feature allows multiple functions to share the same name with different parameters?',
      opts: ['Overriding', 'Overloading', 'Polymorphism', 'Inheritance'], ans: 1 },
    { q: 'Which header must be included to use `cout` in C++?',
      opts: ['<conio.h>', '<iostream>', '<stdio.h>', '<stdlib.h>'], ans: 1 },
    { q: 'What does OOP stand for?',
      opts: ['Object Oriented Programming', 'Open Object Protocol', 'Output Operating Process', 'Object Output Pointer'], ans: 0 },
    { q: 'Which access specifier makes class members inaccessible outside the class?',
      opts: ['public', 'protected', 'private', 'internal'], ans: 2 },
    { q: 'What is the return type of `main()` in a standard C++ program?',
      opts: ['void', 'char', 'int', 'string'], ans: 2 },
    { q: 'What is a constructor in C++?',
      opts: ['A function that destroys objects', 'A function called automatically when an object is created', 'A static class method', 'An overloaded arithmetic operator'], ans: 1 },
    { q: 'Which C++ keyword prevents a variable from being modified after initialisation?',
      opts: ['static', 'volatile', 'const', 'final'], ans: 2 },
    { q: 'What does the `virtual` keyword do in C++?',
      opts: ['Prevents inheritance', 'Enables run-time polymorphism via dynamic dispatch', 'Allocates heap memory', 'Makes a function inline'], ans: 1 },
  ],

  Python: [
    { q: 'What is the output of `print(type([]))` in Python?',
      opts: ["<class 'array'>", "<class 'list'>", "<class 'tuple'>", "<class 'dict'>"], ans: 1 },
    { q: 'Which keyword is used to define a function in Python?',
      opts: ['func', 'define', 'def', 'function'], ans: 2 },
    { q: "What does `len('hello')` return?",
      opts: ['4', '5', '6', 'Error'], ans: 1 },
    { q: 'Which operator is used for exponentiation in Python?',
      opts: ['^', '**', '//', '%%'], ans: 1 },
    { q: 'What is a tuple in Python?',
      opts: ['A mutable ordered list', 'An immutable ordered collection', 'A dictionary type', 'An unordered set structure'], ans: 1 },
    { q: 'How do you start a single-line comment in Python?',
      opts: ['//', '/*', '#', '--'], ans: 2 },
    { q: 'Which string method removes leading and trailing whitespace in Python?',
      opts: ['trim()', 'strip()', 'remove()', 'clean()'], ans: 1 },
    { q: 'Which keyword handles exceptions in Python?',
      opts: ['catch', 'error', 'except', 'handle'], ans: 2 },
    { q: 'Which built-in function converts a value to an integer in Python?',
      opts: ['toInt()', 'Integer()', 'int()', 'num()'], ans: 2 },
    { q: "What does `pass` do in Python?",
      opts: ['Exits the program immediately', 'Skips the current loop iteration', 'Acts as a no-op placeholder', 'Passes a value to a calling function'], ans: 2 },
    { q: 'Which data type does `{1, 2, 3}` create in Python?',
      opts: ['list', 'tuple', 'dict', 'set'], ans: 3 },
    { q: 'What is the output of `bool(0)` in Python?',
      opts: ['True', 'False', '0', 'None'], ans: 1 },
  ],
};

/* ─────────────────────────────────────────────────────────────
   LEADERBOARD SEED DATA
   ──────────────────────────────────────────────────────────── */
const LEADERBOARD = [
  { name: 'Rumi Aktar',    id: 'ID-1809', score: 290, gems: 1450, cat: 'HTML'       },
  { name: 'Sara Khan',     id: 'ID-2041', score: 280, gems: 1400, cat: 'JavaScript' },
  { name: 'Hamza Ali',     id: 'ID-3312', score: 270, gems: 1350, cat: 'Python'     },
  { name: 'Wang Fei',      id: 'ID-4500', score: 260, gems: 1300, cat: 'React'      },
  { name: 'Priya Nair',    id: 'ID-5601', score: 250, gems: 1250, cat: 'C++'        },
  { name: 'Leo Martinez',  id: 'ID-6720', score: 240, gems: 1200, cat: 'HTML'       },
  { name: 'Amara Diallo',  id: 'ID-7843', score: 230, gems: 1150, cat: 'JavaScript' },
  { name: 'Yuki Tanaka',   id: 'ID-8901', score: 220, gems: 1100, cat: 'Python'     },
  { name: 'Omar Faruk',    id: 'ID-9012', score: 210, gems: 1050, cat: 'React'      },
  { name: 'Chloe Bernard', id: 'ID-1001', score: 200, gems: 1000, cat: 'C++'        },
];

/* ─────────────────────────────────────────────────────────────
   RECENT ACTIVITY (home page display)
   ──────────────────────────────────────────────────────────── */
const RECENT_ACTIVITY = [
  { catKey: 'HTML',       correct: 29, total: 30 },
  { catKey: 'JavaScript', correct: 26, total: 30 },
  { catKey: 'React',      correct: 19, total: 30 },
  { catKey: 'Cpp',        correct: 23, total: 30 },
  { catKey: 'Python',     correct: 28, total: 30 },
];