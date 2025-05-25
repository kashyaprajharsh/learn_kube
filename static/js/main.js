// LearnKube - Main JavaScript File

// Wait for the DOM to be fully loaded before executing scripts
document.addEventListener('DOMContentLoaded', function() {
    // =======================================================
    // Navigation & UI Management
    // =======================================================
    
    // Show home section by default
    showSection('hero');
    showSection('features');
    
    // Handle navigation menu clicks
    document.querySelectorAll('[data-section]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.getAttribute('data-section');
            
            // Hide hero and features sections when navigating to content
            if (section !== 'hero') {
                hideSection('hero');
                hideSection('features');
            }
            
            // Hide all content sections
            document.querySelectorAll('.content-section').forEach(s => {
                s.classList.remove('visible');
                s.classList.add('hidden');
            });
            
            // Show selected section
            const targetSection = document.getElementById(`${section}-section`);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                setTimeout(() => {
                    targetSection.classList.add('visible');
                }, 10);
            }
            
            // If section is hero, also show features
            if (section === 'hero') {
                showSection('hero');
                showSection('features');
            }
            
            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu.classList.contains('block')) {
                mobileMenu.classList.remove('block');
                mobileMenu.classList.add('hidden');
            }
        });
    });
    
    // Mobile menu toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton.addEventListener('click', () => {
        if (mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.remove('hidden');
            mobileMenu.classList.add('block');
        } else {
            mobileMenu.classList.remove('block');
            mobileMenu.classList.add('hidden');
        }
    });

    // Helper functions for showing/hiding sections
    function showSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
            setTimeout(() => {
                section.classList.add('visible');
            }, 10);
        }
    }
    
    function hideSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('visible');
            section.classList.add('hidden');
        }
    }
    
    // =======================================================
    // Learn Concepts Section
    // =======================================================
    
    const conceptForm = document.getElementById('concept-form');
    const conceptSpinner = document.getElementById('concept-spinner');
    const conceptResult = document.getElementById('concept-result');
    
    if (conceptForm) {
        conceptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const topic = document.getElementById('concept-topic').value.trim();
            if (!topic) {
                alert('Please enter a topic to learn about.');
                return;
            }
            
            const proficiencyLevel = document.getElementById('proficiency-level').value;
            
            // Show loading state
            conceptForm.classList.add('loading');
            conceptSpinner.classList.remove('d-none');
            
            try {
                const response = await fetch('/explain/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        topic,
                        proficiency_level: proficiencyLevel
                    }),
                });
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Update the UI with the result
                document.getElementById('concept-name').textContent = data.concept_name;
                
                // Format definition with markdown
                document.getElementById('concept-definition').innerHTML = formatInlineMarkdown(data.definition);
                
                // Handle analogy (optional)
                const analogyCard = document.getElementById('concept-analogy-card');
                if (data.analogy) {
                    // Format analogy with markdown
                    document.getElementById('concept-analogy').innerHTML = formatInlineMarkdown(data.analogy);
                    analogyCard.classList.remove('hidden');
                } else {
                    analogyCard.classList.add('hidden');
                }
                
                // Handle core principles
                const principlesList = document.getElementById('concept-principles');
                principlesList.innerHTML = '';
                if (data.core_principles && data.core_principles.length > 0) {
                    data.core_principles.forEach(principle => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item';
                        // Format the text with proper markdown
                        li.innerHTML = formatInlineMarkdown(principle);
                        principlesList.appendChild(li);
                    });
                } else {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.textContent = 'No specific principles provided.';
                    principlesList.appendChild(li);
                }
                
                // Handle example use case (optional)
                const exampleCard = document.getElementById('concept-example-card');
                if (data.example_use_case) {
                    document.getElementById('concept-example').innerHTML = formatTextWithCodeBlocks(data.example_use_case);
                    exampleCard.classList.remove('hidden');
                } else {
                    exampleCard.classList.add('hidden');
                }
                
                // Handle common pitfalls (optional)
                const pitfallsCard = document.getElementById('concept-pitfalls-card');
                const pitfallsList = document.getElementById('concept-pitfalls');
                pitfallsList.innerHTML = '';
                if (data.common_pitfalls && data.common_pitfalls.length > 0) {
                    data.common_pitfalls.forEach(pitfall => {
                        const li = document.createElement('li');
                        li.className = 'list-group-item';
                        // Format the text with proper markdown
                        li.innerHTML = formatInlineMarkdown(pitfall);
                        pitfallsList.appendChild(li);
                    });
                    pitfallsCard.classList.remove('hidden');
                } else {
                    pitfallsCard.classList.add('hidden');
                }
                
                // Handle detailed explanation (new)
                const detailedCard = document.getElementById('concept-detailed-card');
                if (data.detailed_explanation) {
                    const detailedExplanation = document.getElementById('concept-detailed-explanation');
                    
                    // Process the text to detect and format code snippets and Markdown
                    const formattedText = formatTextWithCodeBlocks(data.detailed_explanation);
                    detailedExplanation.innerHTML = formattedText;
                    
                    // Add syntax highlighting to code blocks
                    if (typeof Prism !== 'undefined') {
                        setTimeout(() => {
                            Prism.highlightAllUnder(detailedExplanation);
                        }, 100);
                    }
                    
                    detailedCard.classList.remove('hidden');
                } else {
                    detailedCard.classList.add('hidden');
                }
                
                // Show the result section
                conceptResult.classList.remove('hidden');
                
                // Setup buttons for related content
                setupRelatedContentButtons(topic);
                
                // Setup detailed explanation toggle
                setupDetailedExplanationToggle();
                
            } catch (error) {
                console.error('Error fetching explanation:', error);
                alert('Failed to get explanation. Please try again.');
            } finally {
                // Remove loading state
                conceptForm.classList.remove('loading');
                conceptSpinner.classList.add('d-none');
            }
        });
    }
    
    // Setup related content buttons (Quiz and Challenge)
    function setupRelatedContentButtons(topic) {
        const quizButton = document.getElementById('take-quiz-btn');
        const challengeButton = document.getElementById('try-challenge-btn');
        
        quizButton.addEventListener('click', () => {
            // Navigate to quiz section and preset the topic
            document.querySelectorAll('[data-section="quiz"]')[0].click();
            document.getElementById('quiz-topic').value = topic;
        });
        
        challengeButton.addEventListener('click', () => {
            // Navigate to challenge section
            document.querySelectorAll('[data-section="challenge"]')[0].click();
            // Select "Generate New Challenge" tab
            document.querySelector('[data-challenge-type="generate"]').click();
            // Preset the topic
            document.getElementById('challenge-topic').value = topic;
        });
    }
    
    // =======================================================
    // Challenges Section
    // =======================================================
    
    // Challenge type tab switching
    const challengeTypeTabs = document.querySelectorAll('[data-challenge-type]');
    if (challengeTypeTabs.length > 0) {
        challengeTypeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active state on tabs
                challengeTypeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const type = tab.getAttribute('data-challenge-type');
                
                // Show/hide appropriate sections
                if (type === 'predefined') {
                    document.getElementById('predefined-challenges').classList.remove('hidden');
                    document.getElementById('generate-challenge').classList.add('hidden');
                } else {
                    document.getElementById('predefined-challenges').classList.add('hidden');
                    document.getElementById('generate-challenge').classList.remove('hidden');
                }
            });
        });
    }
    
    // Predefined challenge selection
    const predefinedChallengeButtons = document.querySelectorAll('[data-challenge-id]');
    if (predefinedChallengeButtons.length > 0) {
        predefinedChallengeButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const challengeId = button.getAttribute('data-challenge-id');
                
                // Show challenge detail view
                document.getElementById('challenge-list-view').classList.add('hidden');
                document.getElementById('challenge-detail-view').classList.remove('hidden');
                
                // Set challenge ID for submission
                document.getElementById('current-challenge-id').value = challengeId;
                document.getElementById('challenge-is-dynamic').value = 'false';
                
                // Extract and display challenge details from the button
                document.getElementById('challenge-title').textContent = button.textContent.trim();
                
                // Set the appropriate badge
                const badge = button.querySelector('.badge').textContent;
                document.getElementById('challenge-topic-display').textContent = badge;
                
                // We need to fetch the full challenge details
                try {
                    // In a real app, you would have an API endpoint to fetch challenge details by ID
                    // For now, we'll use hardcoded values for the two predefined challenges
                    let description = '';
                    
                    if (challengeId === 'k8s_debug_pod_crashloop') {
                        description = "A Kubernetes Pod named 'my-app-pod' is in a CrashLoopBackOff state. What are the first three kubectl commands you would use to investigate the cause? List them in order.";
                    } else if (challengeId === 'git_merge_conflict') {
                        description = "You are trying to merge a feature branch named 'new-feature' into 'main'. Git indicates there's a merge conflict in a file named 'config.yaml'. Describe the general steps you would take to resolve this conflict and complete the merge.";
                    }
                    
                    document.getElementById('challenge-description').textContent = description;
                } catch (error) {
                    console.error('Error fetching challenge details:', error);
                    alert('Failed to load challenge details. Please try again.');
                    
                    // Go back to challenge list
                    document.getElementById('challenge-detail-view').classList.add('hidden');
                    document.getElementById('challenge-list-view').classList.remove('hidden');
                }
            });
        });
    }
    
    // Back to challenges button
    const backToChallengesBtn = document.getElementById('back-to-challenges');
    if (backToChallengesBtn) {
        backToChallengesBtn.addEventListener('click', () => {
            document.getElementById('challenge-detail-view').classList.add('hidden');
            document.getElementById('challenge-list-view').classList.remove('hidden');
            
            // Reset the solution input
            document.getElementById('challenge-solution').value = '';
        });
    }
    
    // Generate new challenge form
    const generateChallengeForm = document.getElementById('generate-challenge-form');
    const generateChallengeSpinner = document.getElementById('generate-challenge-spinner');
    
    if (generateChallengeForm) {
        generateChallengeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const topic = document.getElementById('challenge-topic').value.trim();
            if (!topic) {
                alert('Please enter a topic for the challenge.');
                return;
            }
            
            const difficulty = document.getElementById('challenge-difficulty').value;
            
            // Show loading state
            generateChallengeForm.classList.add('loading');
            generateChallengeSpinner.classList.remove('d-none');
            
            try {
                const response = await fetch('/challenges/generate/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        topic,
                        difficulty_hint: difficulty
                    }),
                });
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Store challenge data for submission
                document.getElementById('challenge-is-dynamic').value = 'true';
                document.getElementById('dynamic-challenge-title').value = data.title;
                document.getElementById('dynamic-challenge-topic').value = data.topic;
                document.getElementById('dynamic-challenge-difficulty').value = data.difficulty;
                document.getElementById('dynamic-challenge-description').value = data.description;
                document.getElementById('dynamic-challenge-criteria').value = data.evaluation_criteria;
                document.getElementById('dynamic-challenge-keywords').value = JSON.stringify(data.solution_keywords || []);
                
                // Display challenge details
                document.getElementById('challenge-title').textContent = data.title;
                document.getElementById('challenge-topic-display').textContent = data.topic;
                document.getElementById('challenge-description').textContent = data.description;
                document.getElementById('challenge-difficulty-badge').textContent = data.difficulty;
                
                // Show the challenge detail view
                document.getElementById('challenge-list-view').classList.add('hidden');
                document.getElementById('challenge-detail-view').classList.remove('hidden');
                
            } catch (error) {
                console.error('Error generating challenge:', error);
                alert('Failed to generate challenge. Please try again.');
            } finally {
                // Remove loading state
                generateChallengeForm.classList.remove('loading');
                generateChallengeSpinner.classList.add('d-none');
            }
        });
    }
    
    // Challenge solution submission
    const challengeSolutionForm = document.getElementById('challenge-solution-form');
    const submitChallengeSpinner = document.getElementById('submit-challenge-spinner');
    
    if (challengeSolutionForm) {
        challengeSolutionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const solution = document.getElementById('challenge-solution').value.trim();
            if (!solution) {
                alert('Please enter your solution.');
                return;
            }
            
            // Show loading state
            challengeSolutionForm.classList.add('loading');
            submitChallengeSpinner.classList.remove('d-none');
            
            try {
                let response;
                
                // Check if this is a dynamic or predefined challenge
                const isDynamic = document.getElementById('challenge-is-dynamic').value === 'true';
                
                if (isDynamic) {
                    // Handle dynamic challenge
                    response = await fetch('/challenge/evaluate_dynamic/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            challenge_title: document.getElementById('dynamic-challenge-title').value,
                            challenge_topic: document.getElementById('dynamic-challenge-topic').value,
                            challenge_difficulty: document.getElementById('dynamic-challenge-difficulty').value,
                            challenge_description: document.getElementById('dynamic-challenge-description').value,
                            challenge_evaluation_criteria: document.getElementById('dynamic-challenge-criteria').value,
                            challenge_solution_keywords: JSON.parse(document.getElementById('dynamic-challenge-keywords').value || '[]'),
                            user_solution: solution
                        }),
                    });
                } else {
                    // Handle predefined challenge
                    response = await fetch('/challenge/evaluate/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            challenge_id: document.getElementById('current-challenge-id').value,
                            user_solution: solution
                        }),
                    });
                }
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Display feedback
                displayChallengeFeedback(data);
                
            } catch (error) {
                console.error('Error submitting solution:', error);
                alert('Failed to evaluate solution. Please try again.');
            } finally {
                // Remove loading state
                challengeSolutionForm.classList.remove('loading');
                submitChallengeSpinner.classList.add('d-none');
            }
        });
    }
    
    // Display challenge feedback
    function displayChallengeFeedback(feedback) {
        // Hide challenge detail view and show feedback view
        document.getElementById('challenge-detail-view').classList.add('hidden');
        document.getElementById('challenge-feedback-view').classList.remove('hidden');
        
        // Populate feedback
        document.getElementById('challenge-assessment').textContent = feedback.assessment;
        
        // Positive points
        const positivePointsList = document.getElementById('positive-points');
        positivePointsList.innerHTML = '';
        if (feedback.positive_points && feedback.positive_points.length > 0) {
            feedback.positive_points.forEach(point => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = point;
                positivePointsList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = 'No specific positive points provided.';
            positivePointsList.appendChild(li);
        }
        
        // Areas for improvement
        const improvementCard = document.getElementById('improvement-areas-card');
        const improvementList = document.getElementById('improvement-areas');
        improvementList.innerHTML = '';
        if (feedback.areas_for_improvement && feedback.areas_for_improvement.length > 0) {
            feedback.areas_for_improvement.forEach(area => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = area;
                improvementList.appendChild(li);
            });
            improvementCard.classList.remove('hidden');
        } else {
            improvementCard.classList.add('hidden');
        }
        
        // Next step (optional)
        const nextStepCard = document.getElementById('next-step-card');
        if (feedback.suggested_next_step) {
            document.getElementById('next-step').textContent = feedback.suggested_next_step;
            nextStepCard.classList.remove('hidden');
        } else {
            nextStepCard.classList.add('hidden');
        }
        
        // Detailed explanation
        document.getElementById('detailed-explanation').textContent = feedback.detailed_explanation || 'No detailed explanation provided.';
    }
    
    // Back to challenge detail button
    const backToChallengeDetailBtn = document.getElementById('back-to-challenge-detail');
    if (backToChallengeDetailBtn) {
        backToChallengeDetailBtn.addEventListener('click', () => {
            document.getElementById('challenge-feedback-view').classList.add('hidden');
            document.getElementById('challenge-detail-view').classList.remove('hidden');
        });
    }
    
    // Try another challenge button
    const tryAnotherChallengeBtn = document.getElementById('try-another-challenge');
    if (tryAnotherChallengeBtn) {
        tryAnotherChallengeBtn.addEventListener('click', () => {
            document.getElementById('challenge-feedback-view').classList.add('hidden');
            document.getElementById('challenge-list-view').classList.remove('hidden');
            document.getElementById('challenge-solution').value = '';
        });
    }
    
    // =======================================================
    // Quiz Section
    // =======================================================
    
    // Quiz generation form
    const quizForm = document.getElementById('quiz-form');
    const generateQuizSpinner = document.getElementById('generate-quiz-spinner');
    
    if (quizForm) {
        quizForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const topic = document.getElementById('quiz-topic').value.trim();
            if (!topic) {
                alert('Please enter a topic for the quiz.');
                return;
            }
            
            const difficulty = document.getElementById('quiz-difficulty').value;
            const questionType = document.getElementById('quiz-type').value;
            
            // Show loading state
            quizForm.classList.add('loading');
            generateQuizSpinner.classList.remove('d-none');
            
            try {
                const payload = {
                    topic,
                    difficulty
                };
                
                // Only add requested_question_type if user selected a specific type
                if (questionType) {
                    payload.requested_question_type = questionType;
                }
                
                const response = await fetch('/quiz/generate/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Display the quiz question
                displayQuizQuestion(data);
                
            } catch (error) {
                console.error('Error generating quiz:', error);
                alert('Failed to generate quiz. Please try again.');
            } finally {
                // Remove loading state
                quizForm.classList.remove('loading');
                generateQuizSpinner.classList.add('d-none');
            }
        });
    }
    
    // Display quiz question
    function displayQuizQuestion(question) {
        // Hide quiz generator view and show question view
        document.getElementById('quiz-generator-view').classList.add('hidden');
        document.getElementById('quiz-question-view').classList.remove('hidden');
        
        // Set question type badge
        const questionTypeBadge = document.getElementById('quiz-type-badge');
        switch (question.question_type) {
            case 'multiple_choice':
                questionTypeBadge.textContent = 'Multiple Choice';
                break;
            case 'true_false':
                questionTypeBadge.textContent = 'True/False';
                break;
            case 'short_answer_explanation':
                questionTypeBadge.textContent = 'Short Answer';
                break;
        }
        
        // Set topic badge
        document.getElementById('quiz-topic-badge').textContent = question.topic;
        
        // Set question text
        document.getElementById('quiz-question-text').textContent = question.question_text;
        
        // Store correct answer and explanation for later
        document.getElementById('correct-answer-id').value = question.correct_option_id || '';
        document.getElementById('quiz-answer-explanation').value = question.answer_explanation || '';
        
        // Show appropriate answer input based on question type
        document.getElementById('multiple-choice-options').classList.add('hidden');
        document.getElementById('true-false-options').classList.add('hidden');
        document.getElementById('short-answer-input').classList.add('hidden');
        
        if (question.question_type === 'multiple_choice') {
            const optionsContainer = document.getElementById('options-container');
            optionsContainer.innerHTML = '';
            
            if (question.options && question.options.length > 0) {
                question.options.forEach(option => {
                    // Create the option as a styled button
                    const optionBtn = document.createElement('button');
                    optionBtn.type = 'button';
                    optionBtn.className = 'btn btn-outline-secondary w-100 mb-2 text-start';
                    optionBtn.setAttribute('data-option-id', option.id);
                    
                    optionBtn.innerHTML = `<strong>${option.id}.</strong> ${option.text}`;
                    
                    // Add click handler
                    optionBtn.addEventListener('click', function() {
                        // Remove selected state from all options
                        optionsContainer.querySelectorAll('button').forEach(btn => {
                            btn.classList.remove('active');
                            btn.classList.remove('btn-primary');
                            btn.classList.add('btn-outline-secondary');
                        });
                        
                        // Add selected state to this option
                        this.classList.remove('btn-outline-secondary');
                        this.classList.add('btn-primary');
                        this.classList.add('active');
                    });
                    
                    optionsContainer.appendChild(optionBtn);
                });
            }
            
            document.getElementById('multiple-choice-options').classList.remove('hidden');
        } else if (question.question_type === 'true_false') {
            document.getElementById('true-false-options').classList.remove('hidden');
            
            // Reset selection
            document.querySelectorAll('#true-false-options button').forEach(btn => {
                btn.classList.remove('active');
            });
        } else if (question.question_type === 'short_answer_explanation') {
            document.getElementById('short-answer-input').classList.remove('hidden');
            document.getElementById('short-answer-text').value = '';
        }
    }
    
    // Back to quiz generator button
    const backToQuizGeneratorBtn = document.getElementById('back-to-quiz-generator');
    if (backToQuizGeneratorBtn) {
        backToQuizGeneratorBtn.addEventListener('click', () => {
            document.getElementById('quiz-question-view').classList.add('hidden');
            document.getElementById('quiz-generator-view').classList.remove('hidden');
        });
    }
    
    // True/False option selection
    const trueFalseOptions = document.getElementById('true-false-options');
    if (trueFalseOptions) {
        trueFalseOptions.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', function() {
                trueFalseOptions.querySelectorAll('button').forEach(b => {
                    b.classList.remove('active');
                    b.classList.replace('btn-success', 'btn-outline-success');
                    b.classList.replace('btn-danger', 'btn-outline-danger');
                });
                
                // Add active class and solid button style
                this.classList.add('active');
                if (this.getAttribute('data-answer') === 'True') {
                    this.classList.replace('btn-outline-success', 'btn-success');
                } else {
                    this.classList.replace('btn-outline-danger', 'btn-danger');
                }
            });
        });
    }
    
    // Submit answer button
    const submitAnswerBtn = document.getElementById('submit-answer');
    if (submitAnswerBtn) {
        submitAnswerBtn.addEventListener('click', () => {
            const questionType = document.getElementById('quiz-type-badge').textContent;
            const correctAnswerId = document.getElementById('correct-answer-id').value;
            const explanation = document.getElementById('quiz-answer-explanation').value;
            
            let userAnswer = '';
            let isCorrect = false;
            
            // Get the user's answer based on question type
            if (questionType === 'Multiple Choice') {
                const selectedOption = document.querySelector('#options-container button.active');
                if (!selectedOption) {
                    alert('Please select an answer.');
                    return;
                }
                userAnswer = selectedOption.getAttribute('data-option-id');
            } else if (questionType === 'True/False') {
                const selectedOption = document.querySelector('#true-false-options button.active');
                if (!selectedOption) {
                    alert('Please select True or False.');
                    return;
                }
                userAnswer = selectedOption.getAttribute('data-answer');
            } else if (questionType === 'Short Answer') {
                userAnswer = document.getElementById('short-answer-text').value.trim();
                if (!userAnswer) {
                    alert('Please enter an answer.');
                    return;
                }
            }
            
            // For multiple choice and true/false, we can check correctness
            if (questionType === 'Multiple Choice' || questionType === 'True/False') {
                isCorrect = userAnswer === correctAnswerId;
            }
            
            // Show results view
            document.getElementById('quiz-question-view').classList.add('hidden');
            document.getElementById('quiz-results-view').classList.remove('hidden');
            
            // Display result indicator
            const resultIndicator = document.getElementById('answer-result-indicator');
            resultIndicator.innerHTML = '';
            resultIndicator.classList.remove('correct', 'incorrect');
            
            if (questionType === 'Short Answer') {
                // For short answer, we just show the expected answer
                resultIndicator.innerHTML = `
                    <h4>Model Answer</h4>
                    <p class="mb-0">We've provided the expected answer below.</p>
                `;
            } else {
                // For multiple choice and true/false
                if (isCorrect) {
                    resultIndicator.classList.add('correct');
                    resultIndicator.innerHTML = `
                        <h4><i class="fas fa-check-circle text-success me-2"></i> Correct!</h4>
                        <p class="mb-0">Well done! Your answer is correct.</p>
                    `;
                } else {
                    resultIndicator.classList.add('incorrect');
                    resultIndicator.innerHTML = `
                        <h4><i class="fas fa-times-circle text-danger me-2"></i> Not Quite</h4>
                        <p class="mb-0">The correct answer is: <strong>${correctAnswerId}</strong></p>
                    `;
                }
            }
            
            // Display explanation
            document.getElementById('answer-explanation').textContent = explanation;
        });
    }
    
    // Back to question button
    const backToQuestionBtn = document.getElementById('back-to-question');
    if (backToQuestionBtn) {
        backToQuestionBtn.addEventListener('click', () => {
            document.getElementById('quiz-results-view').classList.add('hidden');
            document.getElementById('quiz-question-view').classList.remove('hidden');
        });
    }
    
    // Try another quiz button
    const tryAnotherQuizBtn = document.getElementById('try-another-quiz');
    if (tryAnotherQuizBtn) {
        tryAnotherQuizBtn.addEventListener('click', () => {
            document.getElementById('quiz-results-view').classList.add('hidden');
            document.getElementById('quiz-generator-view').classList.remove('hidden');
        });
    }
    
    // Setup toggle for detailed explanation
    function setupDetailedExplanationToggle() {
        const toggleBtn = document.getElementById('toggle-details-btn');
        const detailedExplanation = document.getElementById('concept-detailed-explanation');
        
        if (toggleBtn && detailedExplanation) {
            toggleBtn.addEventListener('click', () => {
                const icon = toggleBtn.querySelector('i');
                const toggleText = toggleBtn.querySelector('.toggle-text');
                
                if (detailedExplanation.style.display === 'none') {
                    // Show content
                    detailedExplanation.style.display = 'block';
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                    if (toggleText) toggleText.textContent = 'Hide Details';
                } else {
                    // Hide content
                    detailedExplanation.style.display = 'none';
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                    if (toggleText) toggleText.textContent = 'Show Details';
                }
            });
            
            // Make detailed explanation visible by default
            detailedExplanation.style.display = 'block';
            // Update icon to show up arrow
            toggleBtn.querySelector('i').classList.remove('fa-chevron-down');
            toggleBtn.querySelector('i').classList.add('fa-chevron-up');
        }
    }
    
    // Helper function to detect and format code blocks in text
    function formatTextWithCodeBlocks(text) {
        if (!text) return '';
        
        // First, let's handle code blocks
        let processedText = '';
        let segments = text.split(/```(\w*)/);
        let inCodeBlock = false;
        let language = '';
        
        segments.forEach((segment, index) => {
            if (index % 2 === 0) {
                if (inCodeBlock) {
                    // We're inside a code block
                    if (segment.endsWith('```')) {
                        // Remove the closing markdown
                        segment = segment.substring(0, segment.length - 3);
                        inCodeBlock = false;
                    }
                    processedText += `<pre class="language-${language || 'bash'}"><code class="language-${language || 'bash'}">${escapeHtml(segment.trim())}</code></pre>`;
                } else {
                    // Regular text - process paragraphs, lists, and markdown
                    // First, split into paragraphs
                    const paragraphs = segment.split(/\n\n+/);
                    
                    paragraphs.forEach(paragraph => {
                        // Check if paragraph is a list
                        if (paragraph.trim().match(/^[*-]\s/m)) {
                            // Unordered list
                            const listItems = paragraph.trim().split(/\n[*-]\s/).filter(item => item);
                            if (listItems.length > 0) {
                                let list = '<ul>';
                                // First item may still have the list marker
                                let firstItem = listItems[0].replace(/^[*-]\s/, '');
                                list += `<li>${formatInlineMarkdown(firstItem)}</li>`;
                                
                                for (let i = 1; i < listItems.length; i++) {
                                    list += `<li>${formatInlineMarkdown(listItems[i])}</li>`;
                                }
                                list += '</ul>';
                                processedText += list;
                                return;
                            }
                        } else if (paragraph.trim().match(/^\d+\.\s/m)) {
                            // Ordered list
                            const listItems = paragraph.trim().split(/\n\d+\.\s/).filter(item => item);
                            if (listItems.length > 0) {
                                let list = '<ol>';
                                // First item may still have the list marker
                                let firstItem = listItems[0].replace(/^\d+\.\s/, '');
                                list += `<li>${formatInlineMarkdown(firstItem)}</li>`;
                                
                                for (let i = 1; i < listItems.length; i++) {
                                    list += `<li>${formatInlineMarkdown(listItems[i])}</li>`;
                                }
                                list += '</ol>';
                                processedText += list;
                                return;
                            }
                        } else if (paragraph.trim()) {
                            // Regular paragraph - apply formatting
                            processedText += `<p>${formatInlineMarkdown(paragraph)}</p>`;
                        }
                    });
                }
            } else {
                // This is a language identifier
                language = segment;
                inCodeBlock = true;
            }
        });
        
        return processedText;
    }
    
    // Format inline markdown elements like bold, italic, and inline code
    function formatInlineMarkdown(text) {
        if (!text) return '';
        
        // Handle bold with **text** or __text__
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                   .replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Handle italic with *text* or _text_
        text = text.replace(/\*([^\*]+)\*/g, '<em>$1</em>')
                   .replace(/_([^_]+)_/g, '<em>$1</em>');
        
        // Handle inline code with `code`
        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Handle line breaks
        text = text.replace(/\n/g, '<br>');
        
        return text;
    }
    
    // Helper to escape HTML in code blocks
    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // =======================================================
    // Mind Map Section
    // =======================================================
    
    let mindmapNetwork = null;
    let mindmapData = null;
    let mindmapOptions = null;
    
    // Mind map form submission
    const mindmapForm = document.getElementById('mindmap-form');
    const mindmapSpinner = document.getElementById('mindmap-spinner');
    const generateMindmapBtn = document.getElementById('generate-mindmap-btn');
    
    if (generateMindmapBtn) {
        console.log("Mind map button found, adding event listener");
        generateMindmapBtn.addEventListener('click', function() {
            console.log("Mind map button clicked");
            const topic = document.getElementById('mindmap-topic').value.trim();
            if (!topic) {
                alert('Please enter a topic for the mind map.');
                return;
            }
            
            const depth = document.getElementById('mindmap-depth').value;
            const focusArea = document.getElementById('mindmap-focus').value.trim();
            
            // Show loading state
            mindmapForm.classList.add('loading');
            mindmapSpinner.classList.remove('d-none');
            generateMindmapBtn.disabled = true;
            
            console.log("Generating mind map for:", topic, "depth:", depth, "focus:", focusArea);
            
            // For testing purposes - use sample data as a fallback
            const mockResponse = {
                topic: topic,
                nodes: [
                    { id: "1", label: topic, level: 0, group: "concept", description: "Central concept" },
                    { id: "2", label: "Components", level: 1, group: "concept", description: "Main components" },
                    { id: "3", label: "Architecture", level: 1, group: "concept", description: "System architecture" },
                    { id: "4", label: "Use Cases", level: 1, group: "practice", description: "Common use cases" }
                ],
                edges: [
                    { from_id: "1", to_id: "2", label: "has" },
                    { from_id: "1", to_id: "3", label: "defines" },
                    { from_id: "1", to_id: "4", label: "enables" }
                ]
            };
            
            let data;
            
            // Make API request
            fetch('/mindmap/generate/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic,
                    depth: parseInt(depth),
                    focus_area: focusArea
                }),
            })
            .then(response => {
                console.log("API response received:", response.status);
                if (!response.ok) {
                    console.warn("API call failed, using mock data instead");
                    return mockResponse;
                }
                return response.json();
            })
            .then(responseData => {
                console.log("Data received:", responseData);
                data = responseData;
                
                // Store the mind map data
                mindmapData = data;
                
                // Display the mind map
                displayMindMap(data);
                
                // Show the mind map view
                document.getElementById('mindmap-generator-view').classList.add('hidden');
                document.getElementById('mindmap-display-view').classList.remove('hidden');
                
                // Set the title
                document.getElementById('mindmap-title').textContent = `Mind Map: ${data.topic}`;
            })
            .catch(error => {
                console.error('Error generating mind map:', error);
                alert('Failed to generate mind map. Using mock data instead.');
                
                // Use mock data as fallback
                data = mockResponse;
                mindmapData = data;
                displayMindMap(data);
                document.getElementById('mindmap-generator-view').classList.add('hidden');
                document.getElementById('mindmap-display-view').classList.remove('hidden');
                document.getElementById('mindmap-title').textContent = `Mind Map: ${data.topic} (Demo)`;
            })
            .finally(() => {
                // Remove loading state
                mindmapForm.classList.remove('loading');
                mindmapSpinner.classList.add('d-none');
                generateMindmapBtn.disabled = false;
            });
        });
    } else {
        console.error("Mind map generate button not found!");
    }
    
    // Display the mind map
    function displayMindMap(data) {
        console.log("displayMindMap called with data:", data);
        const container = document.getElementById('mindmap-container');
        
        if (!container) {
            console.error("Mind map container element not found!");
            return;
        }
        
        // Clear previous mind map
        if (mindmapNetwork) {
            console.log("Destroying previous mind map network");
            mindmapNetwork.destroy();
            mindmapNetwork = null;
        }
        
        if (!data || !data.nodes || !data.edges) {
            console.error("Invalid mind map data:", data);
            return;
        }
        
        console.log("Creating interactive mind map");
        
        try {
            // Create a more structured representation of the mind map
            const rootNode = data.nodes.find(node => node.level === 0);
            if (!rootNode) {
                console.error("No root node found in mind map data");
                return;
            }
            
            // Build a hierarchical structure of nodes
            const nodeMap = {};
            data.nodes.forEach(node => {
                nodeMap[node.id] = {
                    ...node,
                    children: [],
                    expanded: node.level < 1, // Only root and level 1 nodes start expanded
                    visible: node.level < 2 // Only show root and immediate children initially
                };
            });
            
            // Connect nodes based on edges
            data.edges.forEach(edge => {
                const parentId = edge.from_id;
                const childId = edge.to_id;
                if (nodeMap[parentId] && nodeMap[childId]) {
                    nodeMap[parentId].children.push(nodeMap[childId]);
                }
            });
            
            // Function to get currently visible nodes and edges
            function getVisibleNetwork() {
                const visibleNodes = [];
                const visibleEdges = [];
                
                // Add all visible nodes
                Object.values(nodeMap).forEach(node => {
                    if (node.visible) {
                        visibleNodes.push({
                            id: node.id,
                            label: node.label,
                            level: node.level,
                            group: node.group,
                            description: node.description,
                            shape: node.level === 0 ? 'ellipse' : 'box',
                            font: {
                                size: node.level === 0 ? 22 : 18 - (node.level * 2),
                                face: 'sans-serif',
                                bold: node.level < 2,
                                color: node.level === 0 ? '#2563eb' : undefined
                            },
                            borderWidth: 2,
                            shadow: node.level === 0,
                            color: node.expanded ? 
                                {border: '#3b82f6', background: '#dbeafe'} : 
                                {border: '#64748b', background: '#f1f5f9'}
                        });
                    }
                });
                
                // Add edges for visible nodes
                data.edges.forEach(edge => {
                    const fromNode = nodeMap[edge.from_id];
                    const toNode = nodeMap[edge.to_id];
                    if (fromNode && toNode && fromNode.visible && toNode.visible) {
                        visibleEdges.push({
                            from: edge.from_id,
                            to: edge.to_id,
                            label: edge.label,
                            arrows: 'to',
                            width: 1.5,
                            color: { color: '#64748b', hover: '#1e40af' },
                            smooth: { type: 'cubicBezier', forceDirection: 'horizontal' }
                        });
                    }
                });
                
                return { visibleNodes, visibleEdges };
            }
            
            // Network options with horizontal layout
            const options = {
                layout: {
                    hierarchical: {
                        direction: 'LR', // Left to right layout
                        sortMethod: 'directed',
                        nodeSpacing: 180,
                        levelSeparation: 200,
                        parentCentralization: true,
                        blockShifting: true
                    }
                },
                physics: {
                    enabled: false
                },
                interaction: {
                    navigationButtons: true,
                    keyboard: true,
                    hover: true,
                    tooltipDelay: 300
                },
                nodes: {
                    shape: 'box',
                    margin: 10,
                    widthConstraint: {
                        maximum: 200
                    },
                    borderWidth: 2,
                    shadow: true,
                    color: {
                        border: '#2563eb',
                        background: '#dbeafe'
                    }
                },
                edges: {
                    smooth: {
                        type: 'cubicBezier',
                        forceDirection: 'horizontal'
                    }
                },
                groups: {
                    concept: {
                        color: {
                            border: '#3b82f6',
                            background: '#dbeafe'
                        }
                    },
                    tool: {
                        color: {
                            border: '#10b981',
                            background: '#d1fae5'
                        }
                    },
                    practice: {
                        color: {
                            border: '#8b5cf6',
                            background: '#ede9fe'
                        }
                    },
                    principle: {
                        color: {
                            border: '#f59e0b',
                            background: '#fef3c7'
                        }
                    },
                    default: {
                        color: {
                            border: '#6b7280',
                            background: '#f3f4f6'
                        }
                    }
                }
            };
            
            // Get initial visible network
            const { visibleNodes, visibleEdges } = getVisibleNetwork();
            
            // Create the network
            const nodes = new vis.DataSet(visibleNodes);
            const edges = new vis.DataSet(visibleEdges);
            const visData = { nodes, edges };
            
            console.log("Creating vis.js network");
            mindmapNetwork = new vis.Network(container, visData, options);
            mindmapOptions = options;
            
            console.log("Mind map network created successfully");
            
            // Add click event for expanding/collapsing nodes
            mindmapNetwork.on('click', function(params) {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    const node = nodeMap[nodeId];
                    
                    if (node) {
                        // Update node details display
                        document.getElementById('selected-node-label').textContent = node.label;
                        document.getElementById('selected-node-description').textContent = node.description || 'No detailed description available.';
                        
                        // Highlight the node details card
                        const detailsCard = document.getElementById('node-details-card');
                        detailsCard.classList.add('highlight');
                        setTimeout(() => {
                            detailsCard.classList.remove('highlight');
                        }, 2000);
                        
                        // If the node has children, toggle their visibility
                        if (node.children && node.children.length > 0) {
                            // Toggle expanded state
                            node.expanded = !node.expanded;
                            
                            // Update visibility of children
                            node.children.forEach(child => {
                                child.visible = node.expanded;
                                
                                // If a child is collapsed, make sure its children are hidden
                                if (!node.expanded) {
                                    makeChildrenInvisible(child);
                                }
                            });
                            
                            // Update the network with the new visibility
                            const { visibleNodes, visibleEdges } = getVisibleNetwork();
                            nodes.clear();
                            edges.clear();
                            nodes.add(visibleNodes);
                            edges.add(visibleEdges);
                            
                            // After updating, fit the view with animation
                            setTimeout(() => {
                                mindmapNetwork.fit({
                                    animation: {
                                        duration: 800,
                                        easingFunction: 'easeOutQuint'
                                    }
                                });
                            }, 50);
                        }
                    }
                }
            });
            
            // Helper function to recursively make all children invisible
            function makeChildrenInvisible(node) {
                if (node.children && node.children.length > 0) {
                    node.children.forEach(child => {
                        child.visible = false;
                        child.expanded = false;
                        makeChildrenInvisible(child);
                    });
                }
            }
            
            // Add hover event for highlighting
            mindmapNetwork.on('hoverNode', function(params) {
                const nodeId = params.node;
                mindmapNetwork.canvas.body.nodes[nodeId].options.borderWidth = 3;
                mindmapNetwork.redraw();
            });
            
            mindmapNetwork.on('blurNode', function(params) {
                const nodeId = params.node;
                mindmapNetwork.canvas.body.nodes[nodeId].options.borderWidth = 2;
                mindmapNetwork.redraw();
            });
            
            // Add double-click event to focus on a node
            mindmapNetwork.on('doubleClick', function(params) {
                if (params.nodes.length > 0) {
                    const nodeId = params.nodes[0];
                    
                    // Focus on the node with animation
                    mindmapNetwork.focus(nodeId, {
                        scale: 1.2,
                        animation: {
                            duration: 800,
                            easingFunction: 'easeInOutQuad'
                        }
                    });
                    
                    // Add a subtle highlight effect
                    const node = mindmapNetwork.canvas.body.nodes[nodeId];
                    const originalColor = node.options.color.background;
                    const originalBorderColor = node.options.color.border;
                    
                    // Flash effect
                    node.options.color.background = '#93c5fd';
                    node.options.color.border = '#2563eb';
                    node.options.borderWidth = 3;
                    mindmapNetwork.redraw();
                    
                    // Restore original color after animation
                    setTimeout(() => {
                        node.options.color.background = originalColor;
                        node.options.color.border = originalBorderColor;
                        node.options.borderWidth = 2;
                        mindmapNetwork.redraw();
                    }, 1000);
                }
            });
            
            // Force a redraw and fit view
            setTimeout(() => {
                if (mindmapNetwork) {
                    console.log("Fitting mind map to view");
                    mindmapNetwork.fit({
                        animation: {
                            duration: 1000,
                            easingFunction: 'easeOutQuint'
                        }
                    });
                }
            }, 100);
            
        } catch (error) {
            console.error("Error creating mind map:", error);
        }
    }
    
    // Back to mind map form button
    const backToMindmapFormBtn = document.getElementById('back-to-mindmap-form');
    if (backToMindmapFormBtn) {
        backToMindmapFormBtn.addEventListener('click', () => {
            document.getElementById('mindmap-display-view').classList.add('hidden');
            document.getElementById('mindmap-generator-view').classList.remove('hidden');
            
            // Clear the form
            document.getElementById('mindmap-topic').value = '';
            document.getElementById('mindmap-focus').value = '';
        });
    }
    
    // Zoom controls
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const resetViewBtn = document.getElementById('reset-view');
    
    if (zoomInBtn && zoomOutBtn && resetViewBtn) {
        zoomInBtn.addEventListener('click', () => {
            if (mindmapNetwork) {
                const scale = mindmapNetwork.getScale() * 1.2;
                mindmapNetwork.moveTo({ scale: scale });
            }
        });
        
        zoomOutBtn.addEventListener('click', () => {
            if (mindmapNetwork) {
                const scale = mindmapNetwork.getScale() / 1.2;
                mindmapNetwork.moveTo({ scale: scale });
            }
        });
        
        resetViewBtn.addEventListener('click', () => {
            if (mindmapNetwork) {
                mindmapNetwork.fit({
                    animation: {
                        duration: 1000,
                        easingFunction: 'easeInOutQuad'
                    }
                });
            }
        });
    }
    
    // Fullscreen toggle
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const container = document.getElementById('mindmap-container');
            const display = document.getElementById('mindmap-display-view');
            
            if (container.parentElement.classList.contains('fullscreen-mode')) {
                // Exit fullscreen
                container.parentElement.classList.remove('fullscreen-mode');
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                
                // Restore container to card body
                const cardBody = document.querySelector('#mindmap-display-view .card-body');
                cardBody.appendChild(container);
            } else {
                // Enter fullscreen
                const fullscreenDiv = document.createElement('div');
                fullscreenDiv.className = 'fullscreen-mode';
                document.body.appendChild(fullscreenDiv);
                
                // Create a header with close button
                const header = document.createElement('div');
                header.className = 'd-flex justify-content-between align-items-center mb-3';
                header.innerHTML = `
                    <h4>${document.getElementById('mindmap-title').textContent}</h4>
                    <button class="btn btn-outline-secondary" id="close-fullscreen">
                        <i class="fas fa-times"></i> Close
                    </button>
                `;
                fullscreenDiv.appendChild(header);
                
                // Move the container to fullscreen div
                fullscreenDiv.appendChild(container);
                
                // Update button icon
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                
                // Add close button event
                document.getElementById('close-fullscreen').addEventListener('click', () => {
                    fullscreenBtn.click(); // Exit fullscreen by triggering this button again
                });
                
                // Resize the network to fit the new container
                setTimeout(() => {
                    if (mindmapNetwork) {
                        mindmapNetwork.fit();
                    }
                }, 100);
            }
        });
    }
    
    // Export as image button
    const exportBtn = document.getElementById('export-mindmap-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            if (mindmapNetwork) {
                // Get canvas with the network image
                const canvas = mindmapNetwork.canvas.frame.canvas;
                
                // Convert canvas to PNG data URL
                const dataUrl = canvas.toDataURL('image/png');
                
                // Create a download link
                const fileName = `mindmap_${mindmapData.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
                
                // Check if FileSaver.js is available
                if (typeof saveAs !== 'undefined') {
                    // Convert data URL to Blob
                    fetch(dataUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            saveAs(blob, fileName);
                        });
                } else {
                    // Fallback if FileSaver.js is not available
                    const downloadLink = document.createElement('a');
                    downloadLink.href = dataUrl;
                    downloadLink.download = fileName;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }
            }
        });
    }
    
    // =======================================================
    // Chat Section
    // =======================================================
    
    // Initialize chat variables
    let isProcessing = false;
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatSpinner = document.getElementById('chat-spinner');
    const chatSubmitBtn = document.getElementById('chat-submit-btn');
    const chatInputCounter = document.getElementById('chat-input-counter');

    // Character limit for chat input
    const CHAR_LIMIT = 500;

    // Update character counter
    if (chatInput) {
        chatInput.addEventListener('input', () => {
            const length = chatInput.value.length;
            chatInputCounter.textContent = `${length}/${CHAR_LIMIT}`;
            
            // Visual feedback when approaching/exceeding limit
            if (length > CHAR_LIMIT) {
                chatInputCounter.classList.add('text-red-500');
                chatInputCounter.classList.remove('text-gray-400');
            } else {
                chatInputCounter.classList.remove('text-red-500');
                chatInputCounter.classList.add('text-gray-400');
            }
        });

        // Allow Enter to submit, Shift+Enter for new line
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!isProcessing && chatInput.value.trim()) {
                    chatForm.dispatchEvent(new Event('submit'));
                }
            }
        });
    }

    // Handle chat form submission
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = chatInput.value.trim();
            if (!message || isProcessing) return;
            
            if (message.length > CHAR_LIMIT) {
                alert(`Please limit your message to ${CHAR_LIMIT} characters.`);
                return;
            }
            
            // Add user message to chat
            appendMessage('user', message);
            
            // Clear input and disable form
            chatInput.value = '';
            chatInputCounter.textContent = `0/${CHAR_LIMIT}`;
            isProcessing = true;
            chatSpinner.classList.remove('d-none');
            chatSubmitBtn.disabled = true;
            
            try {
                const response = await fetch('/generate/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ text: message }),
                });
                
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Add AI response to chat
                appendMessage('ai', data.response || data);
                
            } catch (error) {
                console.error('Error sending message:', error);
                appendMessage('error', 'Sorry, I encountered an error processing your request. Please try again.');
            } finally {
                // Re-enable form
                isProcessing = false;
                chatSpinner.classList.add('d-none');
                chatSubmitBtn.disabled = false;
                chatInput.focus();
            }
        });
    }

    // Function to append a message to the chat
    function appendMessage(type, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex gap-3 mb-4 ${type === 'user' ? 'flex-row-reverse' : ''}`;
        
        // Avatar
        const avatar = document.createElement('div');
        avatar.className = `w-8 h-8 rounded-full flex items-center justify-center ${
            type === 'user' ? 'bg-blue-100' : type === 'ai' ? 'bg-green-100' : 'bg-red-100'
        }`;
        avatar.innerHTML = type === 'user' ? 
            '<i class="fas fa-user text-blue-500"></i>' : 
            type === 'ai' ? '<i class="fas fa-robot text-green-500"></i>' : 
            '<i class="fas fa-exclamation-triangle text-red-500"></i>';
        
        // Message content
        const messageContent = document.createElement('div');
        messageContent.className = `flex-1 ${type === 'user' ? 'text-right' : ''}`;
        
        const messageBubble = document.createElement('div');
        messageBubble.className = `inline-block rounded-lg px-4 py-2 ${
            type === 'user' ? 'bg-blue-500 text-white' : 
            type === 'ai' ? 'bg-gray-100 text-gray-800' : 
            'bg-red-100 text-red-800'
        }`;
        
        // Process markdown and code blocks in AI responses
        if (type === 'ai') {
            messageBubble.innerHTML = formatTextWithCodeBlocks(content);
            // Apply syntax highlighting
            if (typeof Prism !== 'undefined') {
                setTimeout(() => {
                    Prism.highlightAllUnder(messageBubble);
                }, 100);
            }
        } else {
            messageBubble.textContent = content;
        }
        
        messageContent.appendChild(messageBubble);
        
        // Assemble message
        if (type === 'user') {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        }
        
        // Add message to chat
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add entrance animation
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        messageDiv.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        
        // Trigger animation
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
    }
}); 