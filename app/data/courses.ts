export const courses = [
  {
    id: 1,
    code: 'CS 101',
    name: 'Introduction to Computer Science',
    professors: [
      { name: 'Dr. Sarah Johnson', email: 'sjohnson@university.edu' }
    ],
    department: 'Computer Science',
    semester: 'Fall 2026',
    description: 'An introduction to the fundamental concepts of computer science including programming, algorithms, and data structures. This course provides a solid foundation for students beginning their journey in computing.',
    credits: 3,
    textbooks: [
      {
        title: 'Computer Science: An Overview',
        author: 'J. Glenn Brookshear',
        isbn: '978-0134875460',
        edition: '13th Edition',
        required: true,
        price: '$89.99'
      }
    ]
  },
  {
    id: 2,
    code: 'MATH 210',
    name: 'Calculus I',
    professors: [
      { name: 'Dr. Michael Chen', email: 'mchen@university.edu' },
      { name: 'Dr. Lisa Wang', email: 'lwang@university.edu' }
    ],
    department: 'Mathematics',
    semester: 'Fall 2026',
    description: 'First course in calculus covering limits, derivatives, and integrals with applications to various fields. Emphasis on problem-solving and mathematical reasoning.',
    credits: 4,
    textbooks: [
      {
        title: 'Calculus: Early Transcendentals',
        author: 'James Stewart',
        isbn: '978-1285741550',
        edition: '8th Edition',
        required: true,
        price: '$129.99'
      },
      {
        title: 'Student Solutions Manual for Calculus',
        author: 'James Stewart',
        isbn: '978-1285741567',
        edition: '8th Edition',
        required: false,
        price: '$45.99'
      }
    ]
  },
  {
    id: 3,
    code: 'ENG 105',
    name: 'English Composition',
    professors: [
      { name: 'Prof. Emily Rodriguez', email: 'erodriguez@university.edu' }
    ],
    department: 'English',
    semester: 'Fall 2026',
    description: 'Development of critical reading and writing skills through analysis of various texts and composition of essays.',
    credits: 3,
    textbooks: [
      {
        title: 'They Say / I Say: The Moves That Matter in Academic Writing',
        author: 'Gerald Graff & Cathy Birkenstein',
        isbn: '978-0393631678',
        edition: '5th Edition',
        required: true,
        price: '$32.99'
      }
    ]
  },
  {
    id: 4,
    code: 'PHYS 201',
    name: 'General Physics I',
    professors: [
      { name: 'Dr. Robert Kim', email: 'rkim@university.edu' },
      { name: 'Dr. Amanda Martinez', email: 'amartinez@university.edu' },
      { name: 'Prof. James Thompson', email: 'jthompson@university.edu' }
    ],
    department: 'Physics',
    semester: 'Fall 2026',
    description: 'Introductory physics course covering mechanics, thermodynamics, and wave motion with laboratory component.',
    credits: 4,
    textbooks: [
      {
        title: 'University Physics with Modern Physics',
        author: 'Hugh D. Young & Roger A. Freedman',
        isbn: '978-0135159552',
        edition: '15th Edition',
        required: true,
        price: '$149.99'
      },
      {
        title: 'Student Solutions Manual',
        author: 'A. Lewis Ford',
        isbn: '978-0135159736',
        edition: '15th Edition',
        required: false,
        price: '$54.99'
      }
    ]
  },
  {
    id: 5,
    code: 'CS 250',
    name: 'Data Structures and Algorithms',
    professors: [
      { name: 'Dr. Sarah Johnson', email: 'sjohnson@university.edu' }
    ],
    department: 'Computer Science',
    semester: 'Fall 2026',
    description: 'Study of fundamental data structures and algorithms including arrays, linked lists, trees, graphs, sorting, and searching.',
    credits: 4,
    textbooks: [
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen et al.',
        isbn: '978-0262033844',
        edition: '3rd Edition',
        required: true,
        price: '$99.99'
      }
    ]
  },
  {
    id: 6,
    code: 'HIST 101',
    name: 'World History to 1500',
    professors: [
      { name: 'Prof. David Williams', email: 'dwilliams@university.edu' },
      { name: 'Dr. Jennifer Lee', email: 'jlee@university.edu' }
    ],
    department: 'History',
    semester: 'Fall 2026',
    description: 'Survey of world civilizations from ancient times through 1500 CE, exploring political, social, and cultural developments.',
    credits: 3,
    textbooks: [
      {
        title: 'A History of World Societies',
        author: 'Merry E. Wiesner-Hanks et al.',
        isbn: '978-1319059316',
        edition: '11th Edition',
        required: true,
        price: '$119.99'
      }
    ]
  }
];
