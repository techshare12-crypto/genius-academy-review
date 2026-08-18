/**
 * Authoritative Course Configuration for Genius Academy Review Assistant
 * Contains verified course information and natural student satisfaction / experience-style review drafts per course.
 *
 * RULES:
 * - Style: Short, natural, human-sounding student experience / satisfaction review drafts
 * - Length: Strictly 50 to 80 words each (Target: ~60–70 words)
 * - Tone: 70% experience/satisfaction-oriented, 30% course-specific factual context
 * - No brochure/syllabus openings ("The course covers", "The module focuses on", "Students learning...")
 * - No corporate buzzwords ("state-of-the-art", "world-class", "seamless", "cutting-edge")
 * - Easily editable so students can adjust to match their genuine experience
 */

export const VARIATION_ANGLES = [
  { id: 0, focus: 'Overall learning impression and foundational experience' },
  { id: 1, focus: 'Useful practical skills learned and applied' },
  { id: 2, focus: 'Beginner-friendly perspective and ease of learning' },
  { id: 3, focus: 'Practical usefulness for workplace and daily tasks' },
  { id: 4, focus: 'Course relevance and topic clarity' },
  { id: 5, focus: 'Learning confidence and step-by-step understanding' },
  { id: 6, focus: 'Conversational experience and study satisfaction' },
  { id: 7, focus: 'Concise satisfaction-oriented style' },
];

export const COURSES = {
  'MS Office': {
    name: 'MS Office',
    topics: ['Microsoft Word', 'Excel spreadsheet formulas', 'PowerPoint presentations', 'Everyday computer skills'],
    fallbacks: [
      'I found the MS Office training at Genius Academy in Kalaburagi very helpful for improving my everyday computer skills. The sessions made it simple to understand Word document formatting, Excel spreadsheet formulas, and PowerPoint presentations. The practical exercises gave me good confidence in handling office tasks and digital files. It is a worthwhile course for anyone wanting to build solid basic computer skills.',
      'Learning MS Office at Genius Academy was a positive experience for me. The training covers useful tools in Word, Excel, and PowerPoint that are needed for daily office work and study projects. I liked how the lessons were explained in a step-by-step manner with practical examples. I feel this course gives a dependable foundation for anyone looking to learn standard computer applications.',
      'My experience with the MS Office course at Genius Academy was very productive. Learning spreadsheet calculations in Excel and document styling in Word helped me understand practical computer work much better. The training is easy to follow and covers all the essential tools required in an office setting. I would suggest this course to anyone who wants to learn computer basics in Kalaburagi.',
      'Taking up the MS Office course at Genius Academy helped me get comfortable with essential software like Microsoft Word, Excel, and PowerPoint. The topics are very relevant for office documentation and data management. I found the guided exercises clear and practical, which made learning much easier. It is a really good training program for students and beginners looking for foundational digital skills.',
      'I had a good learning experience with the MS Office program at Genius Academy. The topics around Word tables, Excel formulas, and PowerPoint slide layouts were explained clearly with hands-on practice. It helped me build practical confidence for handling routine office and college computer tasks. I would gladly recommend this training to anyone who wants to learn essential computer productivity tools.',
      'The MS Office training at Genius Academy gave me a clear understanding of everyday computer applications. Practicing Excel calculations, Word formatting, and PowerPoint presentations made digital work much simpler to grasp. I appreciated the practical approach and beginner-friendly structure of the coursework. It is a solid choice for learners looking to build dependable computer skills in Kalaburagi.',
    ],
  },

  'Tally with GST': {
    name: 'Tally with GST',
    topics: ['Tally software', 'GST accounting', 'Ledgers and vouchers', 'Computerized bookkeeping'],
    fallbacks: [
      'I found the training at Genius Academy useful for understanding the basics of Tally and GST-related accounting work. The topics covered around ledger entries, vouchers, and tax invoices are relevant to day-to-day computerized accounting, and the course gives a good foundation for working with accounting software. I would suggest this course to anyone looking to build practical knowledge in Tally and GST.',
      'Learning Tally with GST at Genius Academy helped me understand practical computerized bookkeeping and taxation rules much better. The hands-on practice with journal vouchers, inventory tracking, and GST billing gave me solid confidence. The lessons are structured in a clear way for beginners. I feel this course is a worthwhile option for commerce students and anyone interested in modern accounting tools.',
      'My experience with the Tally with GST course at Genius Academy was very positive. The training explains accounting ledgers, purchase and sales registers, and GST calculation in a step-by-step manner that is easy to follow. Practicing on computerized accounting software made the concepts clear and practical. It is a really helpful course for building dependable accounting skills in Kalaburagi.',
      'Taking up the Tally with GST training at Genius Academy gave me valuable exposure to electronic bookkeeping and tax compliance workflows. I liked how the topics connected basic accounting principles with practical software entries and GST invoice generation. The training helped me feel more prepared for office accounting work. I would definitely suggest this course to learners wanting practical Tally knowledge.',
      'I had a great experience learning Tally with GST at Genius Academy. The coursework makes computerized accounting and GST returns simple to understand through regular practical exercises. Learning to manage company accounts, ledgers, and tax vouchers gave me practical confidence. It is a well-structured training program for anyone looking to build a career in accounting and business finance.',
      'The Tally with GST classes at Genius Academy helped me gain clear practical knowledge in computerized accounting. The training covers important areas like stock ledgers, GST calculations, and financial reports that are useful for business accounting. I found the step-by-step explanations easy to learn from. It is a dependable course for anyone wanting to learn accounting software in Kalaburagi.',
    ],
  },

  'Internet Concept': {
    name: 'Internet Concept',
    topics: ['Web browsing', 'Email communication', 'Online tools', 'Safe internet practices'],
    fallbacks: [
      'I found the Internet Concept training at Genius Academy very useful for building confidence in everyday digital and online tasks. The sessions made web browsing, email communication, and online security clear and simple to understand. Practicing search techniques and cloud tools helped me navigate the internet safely. It is a great course for beginners wanting to improve their digital literacy.',
      'Learning Internet Concept at Genius Academy was a very helpful experience for me. The training covers practical topics like sending professional emails, managing online files, and safe browsing habits that I use regularly. The step-by-step guidance made everything easy to learn. I feel this course is an ideal starting point for anyone looking to get comfortable with internet technology.',
      'My experience with the Internet Concept course at Genius Academy was very positive. It gave me a clear understanding of online search methods, account safety, and digital communication tools. The practical demonstrations helped me use internet services with much more confidence. I would recommend this training to anyone who wants to build practical digital skills for study or workplace needs.',
      'Taking the Internet Concept course at Genius Academy helped me understand how to use web tools and digital communication effectively. The topics around safe browsing, email management, and online security are very relevant for daily life. The lessons were beginner-friendly and easy to follow. It is a worthwhile program for anyone wanting to build essential internet knowledge in Kalaburagi.',
    ],
  },

  'English & Kannada Typing': {
    name: 'English & Kannada Typing',
    topics: ['Touch typing', 'Kannada typing layout', 'Keyboard speed and accuracy'],
    fallbacks: [
      'I had a very good experience learning English and Kannada typing at Genius Academy in Kalaburagi. The regular practice drills helped me understand proper finger positioning, keyboard rhythm, and accuracy in both languages. The training gave me good confidence in typing official documents quickly without mistakes. It is a very useful course for anyone preparing for typing exams or office work.',
      'Learning bilingual typing at Genius Academy was really helpful for improving my keyboard speed and accuracy. The step-by-step exercises for both English and Kannada phonetic layouts made practicing enjoyable and productive. I noticed a clear improvement in my typing fluency over time. I would definitely recommend this course to anyone who wants to build dependable typing skills for clerical and administrative jobs.',
      'My experience with the English & Kannada Typing course at Genius Academy was very positive. The systematic accuracy drills and timed transcription practice helped me gain confidence on the keyboard. Learning both language layouts gave me practical skills needed for routine computer work. It is a well-guided training program for students and job seekers in Kalaburagi.',
      'Taking the typing classes at Genius Academy helped me build steady keyboard speed in both English and Kannada. I liked how the training focused on home row placement and reducing typing errors through daily practice. The guidance was patient and easy to follow. It is a solid course for anyone looking to master bilingual typing.',
    ],
  },

  'Hardware & Software': {
    name: 'Hardware & Software',
    topics: ['PC components', 'Operating system setup', 'Hardware troubleshooting'],
    fallbacks: [
      'I found the Hardware & Software training at Genius Academy very informative and practical. The course helped me understand computer components, operating system installation, driver setup, and basic PC troubleshooting. Getting to see how hardware parts work together gave me real confidence in managing computer systems. It is a worthwhile course for anyone interested in computer technical support.',
      'Learning Hardware & Software at Genius Academy was a great experience. The lessons break down computer assembly, formatting, and diagnostic checks into easy-to-understand steps. I found the practical demonstrations on motherboard parts, memory, and utility software very helpful for routine computer maintenance. I would suggest this training to anyone who wants to learn hands-on computer hardware basics.',
      'My experience with the Hardware & Software module at Genius Academy was very positive. The training gave me a clear understanding of desktop components, BIOS settings, and operating system troubleshooting. Learning to solve common computer issues practically was especially useful. It is a well-structured course for students looking to build foundational technical skills in Kalaburagi.',
      'Taking the Hardware & Software course at Genius Academy gave me valuable technical confidence with desktop computers. The topics around system setup, driver updates, and hardware diagnostics were explained in a clear, practical way. I feel this training is a dependable foundation for anyone wanting to understand computer hardware and maintenance.',
    ],
  },

  'Computer Fundamentals': {
    name: 'Computer Fundamentals',
    topics: ['Computer basics', 'Windows desktop navigation', 'File organization', 'Digital literacy'],
    fallbacks: [
      'I had a wonderful learning experience with the Computer Fundamentals course at Genius Academy in Kalaburagi. As a beginner, the step-by-step guidance made understanding desktop navigation, folder management, and basic software tools very easy. The practical exercises helped me overcome my hesitation with computers. It is an excellent starting course for anyone new to computer education.',
      'The Computer Fundamentals training at Genius Academy gave me a solid introduction to basic computer operations. I liked how clearly the concepts of hardware parts, file storage, and desktop utilities were explained. The coursework helped me build daily confidence in using computers for study and personal work. I would gladly recommend this course to beginners.',
      'My experience with Computer Fundamentals at Genius Academy was very helpful. The lessons cover all the essential basics like managing files, using keyboard shortcuts, and navigating operating systems in a simple manner. It gave me the foundational confidence I needed to learn more advanced computer applications. A truly beneficial training for first-time computer learners.',
      'Taking up the Computer Fundamentals course at Genius Academy helped me understand how computers work in everyday life. The hands-on practice with desktop tools and basic software was easy to follow and very practical. I feel much more comfortable using computers now. It is a great foundational course in Kalaburagi.',
    ],
  },

  'D.T.P. (Desktop Publishing)': {
    name: 'D.T.P. (Desktop Publishing)',
    topics: ['Page layout', 'Vector graphics', 'Brochures and flyers', 'Print publishing'],
    fallbacks: [
      'I found the Desktop Publishing (D.T.P.) course at Genius Academy very creative and practical. The training covers useful tools for designing brochures, flyers, visiting cards, and publication page layouts. Learning about typography, vector graphics, and print preparation gave me good confidence in digital design work. It is a worthwhile course for anyone interested in print media and graphic layout.',
      'Learning D.T.P. at Genius Academy was a positive and productive experience for me. The lessons explain page layout design, image placement, and print formatting in a clear, step-by-step way. Practicing on modern publishing tools helped me understand how commercial print documents are created. I would recommend this training to learners looking to build practical graphic publishing skills.',
      'My experience with the D.T.P. program at Genius Academy was very rewarding. The coursework gave me hands-on practice in creating multi-column documents, posters, and digital artwork suitable for printing. I appreciated the clear guidance on color modes and page alignment. It is a solid course for anyone wanting to learn desktop publishing in Kalaburagi.',
      'Taking the D.T.P. classes at Genius Academy helped me develop practical design and publishing capabilities. The topics around document styling, banner layouts, and prepress export settings were explained clearly with relevant examples. I feel this training provides a great foundation for working in printing and advertising design.',
    ],
  },

  'C Programming': {
    name: 'C Programming',
    topics: ['C language syntax', 'Logic building', 'Functions and arrays', 'Pointers and memory'],
    fallbacks: [
      'I had a great learning experience with the C Programming course at Genius Academy in Kalaburagi. The training helped me build strong programming logic and understand core concepts like loops, functions, arrays, and pointers. The hands-on coding exercises made problem-solving much easier to grasp. It is an ideal course for beginners and engineering students starting their coding journey.',
      'Learning C Programming at Genius Academy gave me a clear foundation in software logic and algorithmic thinking. I liked how the lessons progressed from basic syntax and conditions to pointers and memory structures with practical code examples. The guidance made difficult programming concepts simple to follow. I would definitely suggest this course to anyone learning to code.',
      'My experience with the C language course at Genius Academy was very positive. Writing programs for loops, arrays, and user-defined functions helped me understand how code actually executes. The step-by-step debugging practice gave me solid coding confidence. It is a dependable training program for building core software development fundamentals.',
      'Taking C Programming at Genius Academy was very helpful for strengthening my computer science basics. The topics around structured programming, pointer operations, and compilation were explained clearly with plenty of practice. I feel this course gave me the logical foundation needed for learning other programming languages.',
    ],
  },

  'C++ Programming': {
    name: 'C++ Programming',
    topics: ['Object-oriented programming', 'Classes and objects', 'Inheritance and polymorphism'],
    fallbacks: [
      'I found the C++ Programming course at Genius Academy very helpful for mastering object-oriented programming concepts. The training explains classes, objects, inheritance, polymorphism, and standard library components through clear practical examples. Practicing OOP code helped me understand modular software design with confidence. It is a great course for students wanting to build strong programming skills.',
      'Learning C++ at Genius Academy was a rewarding experience for me. The coursework connects basic programming logic with advanced concepts like data encapsulation, constructor design, and virtual functions in an easy-to-follow way. The hands-on coding practice gave me clear insights into scalable application development. I would gladly recommend this training in Kalaburagi.',
      'My experience with the C++ Programming classes at Genius Academy was very productive. The lessons made complex topics like operator overloading and inheritance hierarchies simple to understand through step-by-step coding exercises. It really helped me develop confidence in writing clean, structured code for academic and software projects.',
      'Taking the C++ course at Genius Academy gave me a solid grasp of object-oriented software engineering. The topics around classes, memory management, and reusable code structures were taught with clear practical examples. I feel this course provides a strong foundation for any aspiring software developer.',
    ],
  },

  'Python': {
    name: 'Python',
    topics: ['Python syntax', 'Data collections and lists', 'Functions and modules', 'File handling'],
    fallbacks: [
      'I really enjoyed learning Python at Genius Academy in Kalaburagi. The training makes programming feel accessible and practical, covering Python syntax, lists, dictionaries, custom functions, and basic file handling. The hands-on coding exercises helped me write clean scripts with confidence. I feel this course is a wonderful choice for beginners and students interested in modern programming.',
      'Learning Python at Genius Academy was a very positive experience for me. The lessons were structured in a clear, step-by-step manner that helped me understand logic building, loops, and data structures easily. Practicing real scripting examples made the concepts stick. I would definitely recommend this course to anyone who wants to start coding in Python.',
      'My experience with the Python programming course at Genius Academy was very helpful. The training covers essential tools like modular functions, list comprehensions, and error handling with plenty of practical examples. I liked how beginner-friendly the explanations were throughout the coursework. It is a great training program for building dependable coding skills in Kalaburagi.',
      'Taking up Python at Genius Academy helped me build solid confidence in scripting and programming fundamentals. The topics around data handling, string methods, and custom modules were explained clearly with guided coding drills. It is an excellent course for anyone looking to build practical software and automation knowledge.',
      'I had a great time learning Python at Genius Academy. The coursework breaks down core programming logic, functions, and data collections into simple, manageable lessons with lots of hands-on practice. It helped me feel comfortable writing programs on my own. A very worthwhile and practical course for beginners and technology enthusiasts.',
    ],
  },

  'Java': {
    name: 'Java',
    topics: ['Core Java syntax', 'Object-oriented Java', 'Classes and interfaces', 'Exception handling'],
    fallbacks: [
      'I found the Java training at Genius Academy in Kalaburagi very valuable for understanding core object-oriented software development. The sessions covered class modeling, inheritance, interfaces, packages, and exception handling with clear practical coding examples. It gave me solid confidence in building structured Java applications. A great course for computer science students and beginners.',
      'Learning Java at Genius Academy was a productive and rewarding experience for me. The training breaks down OOP concepts, constructors, and collection frameworks into easy-to-follow lessons. Writing code and debugging practically helped me understand how Java works in real applications. I would gladly suggest this course to anyone looking to learn software programming.',
      'My experience with the Java course at Genius Academy was very positive. The step-by-step lessons on class hierarchies, method overriding, and error handling made learning object-oriented programming enjoyable and clear. The practical exercises gave me strong coding confidence. It is a dependable training program for building software engineering skills.',
      'Taking the Java programming classes at Genius Academy helped me gain a clear understanding of application architecture and OOP design. The topics around interfaces, arrays, and JVM basics were explained with useful hands-on coding drills. I feel this course provides a strong foundation for higher software development studies.',
    ],
  },

  'AutoCAD': {
    name: 'AutoCAD',
    topics: ['2D drafting commands', 'Dimensioning and layers', 'Architectural and engineering layouts'],
    fallbacks: [
      'I had a very positive experience learning AutoCAD at Genius Academy in Kalaburagi. The training helped me understand 2D drafting commands, coordinate systems, dimensioning styles, and multi-layer drawing setups with hands-on practice. Creating technical drawings and floor plans gave me good practical confidence. It is a worthwhile course for engineering students and architectural drafting learners.',
      'Learning AutoCAD at Genius Academy was very helpful for developing precise drafting skills. The lessons explain geometric construction, object snaps, block libraries, and plot sheet setups in a clear, step-by-step way. Practicing on standard drafting layouts made the tools easy to master. I would definitely recommend this course to anyone interested in computer-aided design.',
      'My experience with the AutoCAD course at Genius Academy was very productive. The coursework covers essential 2D technical drawings, dimensioning rules, and viewport scaling with plenty of practical exercises. The guidance made complex drafting tasks simple to learn. It is a solid training program for technical and architectural drawing in Kalaburagi.',
      'Taking the AutoCAD classes at Genius Academy gave me great confidence in producing standardized engineering drawings. The topics around layer properties, hatching, and plot preparation were taught with relevant practical examples. I feel this training is a dependable foundation for civil, mechanical, and architectural drafting work.',
    ],
  },

  '3ds Max': {
    name: '3ds Max',
    topics: ['3D spatial modeling', 'Materials and textures', 'Lighting setup and rendering'],
    fallbacks: [
      'I found the 3ds Max course at Genius Academy very exciting and practical for 3D visualization. The training covers polygon modeling, material mapping, lighting setups, and camera composition through guided design exercises. Seeing my 3D models rendered with realistic lighting gave me immense creative confidence. It is a great course for anyone interested in interior and architectural design.',
      'Learning 3ds Max at Genius Academy was a rewarding experience for me. The lessons explain viewport navigation, edit poly modifiers, texture assignment, and rendering outputs in an easy-to-follow manner. The practical projects helped me understand how 3D visual scenes are crafted. I would recommend this training to learners wanting to explore 3D modeling in Kalaburagi.',
      'My experience with the 3ds Max training at Genius Academy was very positive. The coursework provided hands-on practice in creating three-dimensional objects, applying custom materials, and setting up scene lighting. The step-by-step guidance made learning 3D design enjoyable and clear. A truly worthwhile course for spatial design and visualization.',
      'Taking the 3ds Max classes at Genius Academy helped me build solid skills in 3D modeling and digital rendering. The topics around spline modeling, lighting rigs, and camera focal placement were taught with practical examples. I feel this course gives a dependable foundation for architectural visualization and digital media.',
    ],
  },

  'Lumion': {
    name: 'Lumion',
    topics: ['Real-time 3D rendering', 'Architectural visualization', 'Landscape and lighting effects'],
    fallbacks: [
      'I really enjoyed the Lumion course at Genius Academy in Kalaburagi. The training makes architectural 3D visualization simple and fun, covering model imports, realistic materials, terrain sculpting, and atmospheric lighting. Creating high-resolution rendered views gave me great creative confidence. It is a wonderful course for architecture students and designers looking for fast visual rendering skills.',
      'Learning Lumion at Genius Academy was a fantastic experience. The lessons guide you through importing CAD models, placing realistic landscape elements, and adjusting environmental lighting in a clear, step-by-step way. The fast rendering outputs made practicing visual presentations very satisfying. I would definitely suggest this course to anyone interested in 3D architectural visualization.',
      'My experience with the Lumion training at Genius Academy was very productive. The coursework covers material customization, reflection planes, weather controls, and rendering outputs with plenty of hands-on practice. The practical approach helped me understand architectural presentation workflows with ease. A great training program in Kalaburagi.',
      'Taking the Lumion classes at Genius Academy gave me valuable skills in creating realistic 3D architectural renders. The topics around lighting effects, camera clip paths, and presentation visuals were explained clearly with guided exercises. I feel this training is a dependable foundation for anyone working on architectural designs.',
    ],
  },

  'Other Course': {
    name: 'Other Course',
    topics: ['Computer education', 'Practical digital skills', 'Technical training workflows'],
    fallbacks: [
      'I had a very positive learning experience at Genius Academy in Kalaburagi. The training provided structured lessons, practical computing demonstrations, and clear step-by-step guidance that helped me build confidence in modern software tools. The coursework was easy to follow and relevant to my study and workplace needs. I would gladly recommend Genius Academy to anyone seeking quality computer education.',
      'Learning at Genius Academy helped me develop dependable computer skills and practical software knowledge. The classes were organized in a beginner-friendly manner with plenty of hands-on practice to reinforce each topic. I appreciated the clear explanations and supportive learning environment. It is a solid institute for technical and computer training in Kalaburagi.',
      'My experience with the training program at Genius Academy was very helpful and productive. The coursework covered essential computing concepts and practical digital workflows that made everyday computer tasks much easier to manage. The guided exercises gave me good confidence in using software applications. A worthwhile training for students and working professionals.',
      'Taking up computer training at Genius Academy in Kalaburagi gave me valuable practical skills for academic and office work. The lessons were well-structured, easy to understand, and focused on real-world computing tasks. I feel much more confident in handling digital software and routine computer operations now.',
    ],
  },
};

/**
 * Returns list of 15 customer-facing courses
 */
export const COURSES_LIST = Object.keys(COURSES);

/**
 * Returns verified course context
 * @param {string} courseName
 * @returns {object|null}
 */
export function getCourseContext(courseName) {
  if (!courseName || typeof courseName !== 'string') return null;
  return COURSES[courseName.trim()] || null;
}

/**
 * Validates course selection
 * @param {string} courseName
 * @returns {boolean}
 */
export function isValidCourse(courseName) {
  if (!courseName || typeof courseName !== 'string') return false;
  return Object.prototype.hasOwnProperty.call(COURSES, courseName.trim());
}
