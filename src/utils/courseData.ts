export interface TargetLanguage {
  category: string;
  expressions: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  targetLanguage?: TargetLanguage[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  courses: Course[];
}

export interface SkillLevel {
  skill: string;
  level: string;
  modules: Module[];
}

// Example data structure for Welcoming Visitors at B1 level
export const WELCOMING_VISITORS_B1: SkillLevel = {
  skill: 'Welcoming Visitors',
  level: 'B1',
  modules: [
    {
      id: 'module1',
      title: 'Be at Ease to Welcome a Visitor',
      description: 'Learn how to confidently greet and welcome visitors using formal and informal language, and ask for relevant information.',
      courses: [
        {
          id: 'course1_1',
          title: 'Welcome Visitors',
          description: 'Master formal and informal greetings and introductions.',
          targetLanguage: [
            {
              category: 'Greeting visitors',
              expressions: [
                'Welcome to [company name]',
                'It\'s a pleasure to meet you',
                'How was your journey?'
              ]
            },
            {
              category: 'Introducing yourself',
              expressions: [
                'I\'m [name] from the [department] department',
                'I\'ll be your host today'
              ]
            },
            {
              category: 'Offering assistance',
              expressions: [
                'Can I get you anything?',
                'Would you like some coffee/tea?',
                'Let me show you to the meeting room'
              ]
            },
            {
              category: 'Making small talk',
              expressions: [
                'How is your stay so far?',
                'Is this your first time visiting our city?',
                'Did you have any trouble finding us?'
              ]
            },
            {
              category: 'Giving directions',
              expressions: [
                'The meeting room is on the second floor',
                'The restrooms are down the hall on your right'
              ]
            }
          ]
        },
        {
          id: 'course1_2',
          title: 'Ask for Specific Information',
          description: 'Ask for detailed information about the visitor\'s purpose, role, and expectations using indirect and open-ended questions.',
          targetLanguage: [
            {
              category: 'Essential Expressions and Keywords',
              expressions: [
                'Could you tell me...?',
                'I\'d like to know...',
                'Would you mind sharing...?',
                'Can I ask about...?',
                'I need to find out...',
                'Would it be possible to...?',
                'May I have your...?',
                'When would you prefer...?',
                'How long will you...?',
                'What exactly do you need for...?'
              ]
            }
          ]
        },
        {
          id: 'course1_3',
          title: 'Ask for Clarification and Paraphrase Information',
          description: 'Use more complex clarification techniques and paraphrasing to ensure understanding.',
          targetLanguage: [
            {
              category: 'Asking for Clarification',
              expressions: [
                'Could you repeat that, please?',
                'I\'m sorry, I didn\'t catch your name.',
                'Would you mind speaking more slowly?',
                'I\'m not sure I understand. Do you mean...?',
                'Could you explain what you mean by...?'
              ]
            },
            {
              category: 'Paraphrasing Information',
              expressions: [
                'So, if I understand correctly...',
                'Let me make sure I\'ve got this right...',
                'In other words, you\'re saying that...',
                'Just to confirm, you need...',
                'So your main concern is...'
              ]
            },
            {
              category: 'Confirming Details',
              expressions: [
                'Let me just check that I have your details correct.',
                'Is that spelled...?',
                'So you\'ll be here until Thursday, correct?',
                'You\'re here to meet with the engineering team, right?',
                'Can I just confirm your appointment time?'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module2',
      title: 'Receive a Visitor at Your Office',
      description: 'Develop skills to introduce yourself and your colleagues, keep conversations going, and respond to a variety of questions.',
      courses: [
        {
          id: 'course2_1',
          title: 'Greet, Introduce Yourself, Present Your Job and Colleagues',
          description: 'Confidently introduce yourself, your job, and your responsibilities.',
          targetLanguage: [
            {
              category: 'Greetings',
              expressions: [
                'Welcome to [company name]',
                'Good morning/afternoon',
                'It\'s a pleasure to meet you'
              ]
            },
            {
              category: 'Introducing Yourself',
              expressions: [
                'My name is…',
                'I\'m [name]',
                'I work as…',
                'I\'m responsible for…'
              ]
            },
            {
              category: 'Presenting Colleagues',
              expressions: [
                'Let me introduce you to…',
                'This is my colleague…',
                'She/He handles…'
              ]
            },
            {
              category: 'Describing Roles',
              expressions: [
                'I\'m in charge of…',
                'My department deals with…',
                'We\'re responsible for…'
              ]
            },
            {
              category: 'Offering Assistance',
              expressions: [
                'How can I help you today?',
                'Would you like some coffee?',
                'Let me show you around'
              ]
            }
          ]
        },
        {
          id: 'course2_2',
          title: 'Maintain a Good Relationship: Asking Questions / Keep the Conversation Going',
          description: 'Keep conversations flowing with open-ended questions and active listening.',
          targetLanguage: [
            {
              category: 'Conversation Techniques',
              expressions: [
                'How about you?',
                'That sounds interesting!',
                'Could you tell me more about…?',
                'I\'d be interested to know…',
                'I see what you mean.',
                'By the way…',
                'Speaking of which…',
                'Really?',
                'What do you think about…?',
                'I couldn\'t help wondering…'
              ]
            }
          ]
        },
        {
          id: 'course2_3',
          title: 'Understand and Respond to a Wide Range of Questions',
          description: 'Improve fluency in answering both expected and unexpected visitor queries.',
          targetLanguage: [
            {
              category: 'Professional Responses',
              expressions: [
                'How can I help you today?',
                'Let me find that information for you.',
                'That\'s a good question.',
                'I\'m not sure about that, but I can find out for you.',
                'Would you like me to explain that in more detail?',
                'Is there anything else you\'d like to know?',
                'Please feel free to ask if you have any other questions.',
                'I\'ll connect you with the right person.'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module3',
      title: 'Presenting the Company to Visitors',
      description: 'Practice describing your organization, giving key information, and speaking about the company\'s history and achievements.',
      courses: [
        {
          id: 'course3_1',
          title: 'Describe the Organisation',
          description: 'Provide an overview of your company\'s structure, mission, and main activities.',
          targetLanguage: [
            {
              category: 'Introducing the company',
              expressions: [
                'Welcome to [company name]',
                'Let me tell you about our company'
              ]
            },
            {
              category: 'Describing what you do',
              expressions: [
                'We specialize in…',
                'Our main focus is…'
              ]
            },
            {
              category: 'Explaining company structure',
              expressions: [
                'Our company is divided into…',
                'We have several departments, including…'
              ]
            },
            {
              category: 'Highlighting services',
              expressions: [
                'We offer a range of services, such as…',
                'Our key services include…'
              ]
            },
            {
              category: 'Concluding',
              expressions: [
                'That covers the main aspects of our organisation',
                'Do you have any questions about what we do?'
              ]
            }
          ]
        },
        {
          id: 'course3_2',
          title: 'Give Key Information',
          description: 'Communicate essential details about services, departments, and points of contact.',
          targetLanguage: [
            {
              category: 'Essential Information',
              expressions: [
                'We specialize in…',
                'Our main products/services include…',
                'What sets us apart is…',
                'We\'re proud of…',
                'Our company was founded in…',
                'We currently have…',
                'Our mission is to…',
                'Let me tell you about…',
                'Would you like to know more about…?',
                'Do you have any questions about…?'
              ]
            }
          ]
        },
        {
          id: 'course3_3',
          title: 'Speak About the History of the Company',
          description: 'Summarize the company\'s background, achievements, and future goals.',
          targetLanguage: [
            {
              category: 'Talking about history and milestones',
              expressions: [
                'Was founded in…',
                'Was established…',
                'Originally started as…',
                'Grew from… to…',
                'Expanded into…',
                'Turning point…',
                'Since then…',
                'Over the years…',
                'Was recognized for…',
                'Key milestone…'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module4',
      title: 'Put the Visitor at Ease',
      description: 'Focus on asking about the visitor\'s needs, making polite offers, and engaging in small talk to create a welcoming environment.',
      courses: [
        {
          id: 'course4_1',
          title: 'Ask About the Needs of the Person You Are Talking To',
          description: 'Identify and respond to the visitor\'s needs clearly and politely.',
          targetLanguage: [
            {
              category: 'Asking about needs',
              expressions: [
                'How can I help you today?',
                'What brings you to our office?',
                'Could you tell me more about what you need?',
                'Is there anything specific you\'re looking for?',
                'May I ask why you need this information?'
              ]
            },
            {
              category: 'Clarifying information',
              expressions: [
                'Just to confirm, you need…',
                'So, if I understand correctly…',
                'Let me make sure I\'ve got this right…',
                'Could you explain that in more detail?',
                'When exactly do you need this?'
              ]
            },
            {
              category: 'Responding to requests',
              expressions: [
                'I\'d be happy to help you with that.',
                'I\'ll see what I can do about that right away.',
                'Let me check if that\'s possible.',
                'I\'m afraid that might take some time.',
                'Would it be okay if…?'
              ]
            }
          ]
        },
        {
          id: 'course4_2',
          title: 'Engage in Small Talk',
          description: 'Use natural and polite conversation techniques to create a relaxed atmosphere.',
          targetLanguage: [
            {
              category: 'Conversation openers and transitions',
              expressions: [
                'Breaking the ice',
                'Catching up',
                'How\'s it going?',
                'I couldn\'t agree more',
                'That sounds interesting',
                'By the way…',
                'I\'ve been meaning to ask…',
                'It was nice talking to you'
              ]
            }
          ]
        },
        {
          id: 'course4_3',
          title: 'Invite Someone to Wait — Polite Offers',
          description: 'Politely ask a visitor to wait and offer comfort or refreshments during the wait.',
          targetLanguage: [
            {
              category: 'Polite waiting requests',
              expressions: [
                'Would you mind waiting…?',
                'I\'ll let [person] know you\'re here',
                'It should only be about [time period]',
                'Would you like…?',
                'Please make yourself comfortable',
                'I apologize for the delay/wait',
                'Can I get you anything while you wait?'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module5',
      title: 'Give Directions In and Outside the Company',
      description: 'Use appropriate vocabulary and expressions to guide visitors inside your workplace or to external locations.',
      courses: [
        {
          id: 'course5_1',
          title: 'Vocabulary to Describe Your Surroundings',
          description: 'Use precise language and prepositions to describe workplace locations and surroundings.',
          targetLanguage: [
            {
              category: 'Directional Terms',
              expressions: [
                'Straight ahead',
                'Turn right/left',
                'Go past',
                'Next to',
                'Between',
                'Opposite',
                'On your right/left',
                'At the end of',
                'Through the door'
              ]
            },
            {
              category: 'Location Prepositions',
              expressions: [
                'In front of',
                'Behind',
                'Above/below',
                'Inside/outside',
                'On the corner of',
                'On the ground/first/second floor'
              ]
            },
            {
              category: 'Descriptive Language',
              expressions: [
                'The open-plan area',
                'The reception desk',
                'The conference room',
                'The cafeteria/canteen',
                'The elevator/lift',
                'The staircase',
                'The printing room',
                'The lobby'
              ]
            }
          ]
        },
        {
          id: 'course5_2',
          title: 'Give Directions Inside the Company',
          description: 'Guide visitors to rooms, departments, or facilities within the company using clear and helpful directions.',
          targetLanguage: [
            {
              category: 'Basic directions',
              expressions: [
                'Go straight ahead.',
                'Turn left/right at the end of the corridor.',
                'Take the elevator/lift to the third floor.',
                'The meeting room is on your right/left.'
              ]
            },
            {
              category: 'Referring to floors and areas',
              expressions: [
                'We\'re currently on the ground floor.',
                'The marketing department is on the second floor.',
                'The cafeteria is in the east wing of the building.'
              ]
            },
            {
              category: 'Using landmarks',
              expressions: [
                'You\'ll see a large plant/painting/reception desk.',
                'Walk past the water cooler.',
                'When you reach the photocopier, turn right.'
              ]
            },
            {
              category: 'Confirming understanding',
              expressions: [
                'Do you understand the directions?',
                'Would you like me to show you the way?',
                'Is that clear, or would you like me to repeat?'
              ]
            },
            {
              category: 'Offering additional help',
              expressions: [
                'I can walk with you to the meeting room.',
                'Let me know if you need any help finding it.',
                'Feel free to call me if you get lost.'
              ]
            }
          ]
        },
        {
          id: 'course5_3',
          title: 'Give Directions Outside of the Company',
          description: 'Provide directions to nearby locations and recommend transport or landmarks.',
          targetLanguage: [
            {
              category: 'Asking for directions',
              expressions: [
                'Excuse me, could you tell me how to get to…?',
                'Is there a good restaurant/café near here?',
                'What\'s the best way to reach…?',
                'How far is it to…?'
              ]
            },
            {
              category: 'Giving directions',
              expressions: [
                'Go straight ahead for about…',
                'Turn left/right at the traffic lights/corner',
                'Take the first/second turning on the left/right',
                'It\'s about a 10-minute walk from here',
                'You can\'t miss it'
              ]
            },
            {
              category: 'Recommending transport',
              expressions: [
                'The fastest way would be to take the bus/train/metro',
                'I\'d recommend walking/taking a taxi',
                'It might be better to use public transport',
                'It\'s within walking distance'
              ]
            },
            {
              category: 'Describing location',
              expressions: [
                'It\'s next to/opposite/between…',
                'It\'s on the corner of… and…',
                'When you see the bank, it\'s just past that',
                'It\'s across from the park'
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'module6',
      title: 'Take Leave of the Visitor',
      description: 'Learn polite and professional ways to end a visit, offer further help, and suggest future contact.',
      courses: [
        {
          id: 'course6_1',
          title: 'Expressions and Techniques to Take Leave of Your Interlocutor',
          description: 'End a visit professionally and warmly using appropriate language and gestures.',
          targetLanguage: [
            {
              category: 'Wrapping up a conversation',
              expressions: [
                'I\'ve enjoyed our conversation.',
                'It was nice talking with you.',
                'I should let you get back to your day.',
                'I\'m afraid I need to attend to…',
                'Before you go…'
              ]
            },
            {
              category: 'Promising future contact',
              expressions: [
                'Let\'s stay in touch.',
                'I\'ll email you the information by tomorrow.',
                'Feel free to contact me if you have any questions.',
                'I look forward to our next meeting.'
              ]
            },
            {
              category: 'Saying goodbye',
              expressions: [
                'Have a nice day.',
                'It was a pleasure meeting you.',
                'Safe travels.',
                'Thank you for stopping by.',
                'Take care.'
              ]
            },
            {
              category: 'Body language cues',
              expressions: [
                'Standing up',
                'Offering a handshake',
                'Moving slightly toward the door',
                'Gathering papers/materials',
                'Checking the time respectfully'
              ]
            }
          ]
        },
        {
          id: 'course6_2',
          title: 'Offering Help',
          description: 'Reassure the visitor with final offers of help and support before they leave.',
          targetLanguage: [
            {
              category: 'Helpful Expressions',
              expressions: [
                'Can I help you with anything?',
                'Do you need any assistance?',
                'You look a bit lost. Can I point you in the right direction?',
                'Would you like me to show you around?',
                'Let me know if you need anything else.',
                'I\'d be happy to help you with that.',
                'Is there anything specific you\'re looking for?',
                'Feel free to ask if you have any questions.',
                'How can I make your visit more comfortable?',
                'Would you like me to explain how this works?'
              ]
            }
          ]
        },
        {
          id: 'course6_3',
          title: 'Making Reference to Future Contact',
          description: 'Leave the door open for future communication with polite follow-up and contact-sharing expressions.',
          targetLanguage: [
            {
              category: 'Arranging future meetings',
              expressions: [
                'Could we schedule another meeting?',
                'When would be a good time to meet again?',
                'Are you available next week?',
                'I\'d like to follow up on this next month.'
              ]
            },
            {
              category: 'Exchanging contact information',
              expressions: [
                'Let me give you my business card.',
                'Could I have your email address?',
                'Here\'s my phone number.',
                'Feel free to contact me if you have any questions.'
              ]
            },
            {
              category: 'Maintaining professional relationships',
              expressions: [
                'I\'ll send you the information we discussed.',
                'I look forward to working with you.',
                'Please keep me updated on your progress.',
                'Don\'t hesitate to get in touch.'
              ]
            }
          ]
        }
      ]
    }
  ]
};

// List of all available skills
export const SKILLS = [
  'Welcoming Visitors',
  'Negotiations',
  'Presentations',
  'Social Exchanges',
  'Meetings',
  'Professional Oral Communications',
  'Writing',
  'Telephone'
];

// List of all available levels
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']; 