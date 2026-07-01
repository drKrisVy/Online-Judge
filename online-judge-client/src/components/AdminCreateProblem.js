import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Our bridge to the backend

const AdminCreateProblem = () => {
    const navigate = useNavigate();

    // 1. SETUP STATE: We use React state to hold whatever the user types into the form.
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [difficulty, setDifficulty] = useState('Medium');
    const [timeLimit, setTimeLimit] = useState(1000);
    const [memoryLimit, setMemoryLimit] = useState(256);
    
    // Test cases are an array because a problem can have multiple! We start with one blank test case.
    const [testCases, setTestCases] = useState([
        { input: '', output: '', isHidden: false }
    ]);

    // 2. ADD TEST CASE FUNCTION: When clicked, this adds a new blank object to our testCases array.
    const handleAddTestCase = () => {
        setTestCases([...testCases, { input: '', output: '', isHidden: true }]);
    };

    // 3. UPDATE TEST CASE FUNCTION: This updates a specific test case when the user types in it.
    const handleTestCaseChange = (index, field, value) => {
        const updatedTestCases = [...testCases];
        updatedTestCases[index][field] = value;
        setTestCases(updatedTestCases);
    };

    // 4. SUBMIT FUNCTION: This runs when the "Publish Problem" button is clicked.
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the page from refreshing
        
        // Package all our state into one neat object
        const problemData = { title, description, difficulty, timeLimit, memoryLimit, testCases };

        try {
            // Send the package to the backend route we created earlier
            await api.post('/problems/admin/create', problemData);
            alert('Problem successfully created!');
            navigate('/problems'); // Instantly redirect the user to see their new problem in the table!
        } catch (error) {
            console.error("Failed to create problem", error);
            alert('Error creating problem. Check console.');
        }
    };

    // 5. THE UI: This maps directly to the layout in your HLD screenshots.
    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', fontFamily: 'Arial' }}>
            <h2>Admin: Create New Problem</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                <input 
                    type="text" 
                    placeholder="Problem Title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    style={{ padding: '10px', fontSize: '16px' }}
                />
                
                <textarea 
                    placeholder="Problem Description..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    required 
                    rows="6"
                    style={{ padding: '10px', fontSize: '16px' }}
                />

                <div style={{ display: 'flex', gap: '20px' }}>
                    <label>
                        Difficulty: 
                        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ marginLeft: '10px' }}>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                    </label>
                    <label>
                        Time Limit (ms):
                        <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} style={{ width: '80px', marginLeft: '10px' }} />
                    </label>
                    <label>
                        Memory Limit (MB):
                        <input type="number" value={memoryLimit} onChange={(e) => setMemoryLimit(e.target.value)} style={{ width: '80px', marginLeft: '10px' }} />
                    </label>
                </div>

                <hr style={{ width: '100%', margin: '20px 0' }} />
                <h3>Test Cases</h3>

                {testCases.map((tc, index) => (
                    <div key={index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
                        <strong>Test Case #{index + 1}</strong>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <textarea 
                                placeholder="Input" 
                                value={tc.input} 
                                onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} 
                                style={{ flex: 1, height: '60px' }}
                            />
                            <textarea 
                                placeholder="Output" 
                                value={tc.output} 
                                onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} 
                                style={{ flex: 1, height: '60px' }}
                            />
                        </div>
                        <label style={{ display: 'block', marginTop: '10px' }}>
                            <input 
                                type="checkbox" 
                                checked={tc.isHidden} 
                                onChange={(e) => handleTestCaseChange(index, 'isHidden', e.target.checked)} 
                            />
                            Hidden Test Case? (Used for system grading)
                        </label>
                    </div>
                ))}

                <button type="button" onClick={handleAddTestCase} style={{ padding: '10px', backgroundColor: '#e2e3e5', border: '1px solid #ccc', cursor: 'pointer' }}>
                    + Add Another Test Case
                </button>

                <button type="submit" style={{ padding: '15px', backgroundColor: '#0056b3', color: 'white', border: 'none', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}>
                    Publish Problem
                </button>
            </form>
        </div>
    );
};

export default AdminCreateProblem;