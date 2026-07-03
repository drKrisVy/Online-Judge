import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import api from '../api/axios';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const STARTER_CODES = {
    cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // write code here\n    \n    return 0;\n}`,
    java: `import java.util.*;\n\nclass Main {\n    public static void main(String[] args) {\n        // write code here\n        \n    }\n}`,
    py: `import sys\n\ndef solve():\n    # write code here\n    pass\n\nif __name__ == '__main__':\n    solve()`
};

// Initialize socket OUTSIDE component to prevent multiple instances, but keep it disconnected initially
const socket = io('https://online-judge.online', {
    withCredentials: true,
    autoConnect: false, 
});

const Workspace = () => {
    const { id } = useParams(); 
    const [searchParams, setSearchParams] = useSearchParams();
    const sessionId = searchParams.get('session'); 
    const navigate = useNavigate();
    
    // --- AUTHENTICATION CHECK ---
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser && storedUser !== 'undefined') {
                setUser(JSON.parse(storedUser));
            } else {
                navigate('/login', { replace: true });
            }
        } catch (e) {
            console.error("Failed to parse user");
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    const userId = user?.id || user?._id;
    
    const [problemData, setProblemData] = useState(null);
    const [language, setLanguage] = useState('cpp');
    const [code, setCode] = useState(STARTER_CODES['cpp']);
    const [activeTab, setActiveTab] = useState('editor');
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const [submissionResult, setSubmissionResult] = useState(''); 
    const [isGeneratingHint, setIsGeneratingHint] = useState(false);
    const [aiHint, setAiHint] = useState("");
    const [copied, setCopied] = useState(false);

    const canvasRef = useRef(null);
    const isDrawing = useRef(false);
    const currentPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        setCode(STARTER_CODES[language]);
    }, [language]);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const response = await api.get(`/problems/${id}`);
                setProblemData(response.data);
            } catch (error) {
                console.error("Error fetching problem:", error);
            }
        };
        if (id) fetchProblem();
    }, [id]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const parent = canvas.parentElement;

        const resizeCanvas = () => {
            if (parent.clientWidth > 0 && parent.clientHeight > 0) {
                if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
                    const ctx = canvas.getContext('2d');
                    let imgData;
                    if (canvas.width > 0 && canvas.height > 0) {
                        imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    }
                    canvas.width = parent.clientWidth;
                    canvas.height = parent.clientHeight;
                    if (imgData) ctx.putImageData(imgData, 0, 0);
                }
            }
        };

        const timeoutId = setTimeout(resizeCanvas, 150);
        window.addEventListener('resize', resizeCanvas);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [activeTab]); // Added activeTab to dependency array so it resizes when switching tabs

    const drawLine = useCallback((x0, y0, x1, y1, color, emit) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const context = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        context.beginPath();
        context.moveTo(emit ? x0 : x0 * w, emit ? y0 : y0 * h);
        context.lineTo(emit ? x1 : x1 * w, emit ? y1 : y1 * h);
        context.strokeStyle = color;
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.stroke();
        context.closePath();

        if (!emit || !sessionId) return;

        socket.emit('draw', {
            roomId: sessionId,
            drawingData: { x0: x0 / w, y0: y0 / h, x1: x1 / w, y1: y1 / h, color }
        });
    }, [sessionId]);

    const clearCanvas = useCallback((emit = true) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        if (emit && sessionId) {
            socket.emit('clear-canvas', { roomId: sessionId });
        }
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId) {
            const newSession = uuidv4();
            setSearchParams({ session: newSession }, { replace: true });
            return; 
        }

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit('join-room', sessionId);

        socket.on('receive-code-change', (newCode) => {
            setCode(newCode);
        });

        socket.on('receive-draw', (data) => {
            drawLine(data.x0, data.y0, data.x1, data.y1, data.color, false);
        });

        socket.on('receive-clear-canvas', () => {
            clearCanvas(false);
        });

        // Cleanup function to prevent memory leaks when leaving the workspace
        return () => {
            socket.off('receive-code-change');
            socket.off('receive-draw');
            socket.off('receive-clear-canvas');
            socket.emit('leave-room', sessionId); // Optional: if your backend handles this
        };
    }, [sessionId, setSearchParams, drawLine, clearCanvas]);

    const handleEditorChange = (value) => {
        setCode(value);
        if (sessionId) {
            socket.emit('code-change', { roomId: sessionId, newCode: value });
        }
    };

    const getCoordinates = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;    
        const scaleY = canvas.height / rect.height;  
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    };

    const onMouseDown = (e) => {
        isDrawing.current = true;
        currentPos.current = getCoordinates(e);
    };

    const onMouseUp = (e) => {
        if (!isDrawing.current) return;
        isDrawing.current = false;
        const newPos = getCoordinates(e);
        drawLine(currentPos.current.x, currentPos.current.y, newPos.x, newPos.y, '#6b4ce6', true);
    };

    const onMouseMove = (e) => {
        if (!isDrawing.current) return;
        const newPos = getCoordinates(e);
        drawLine(currentPos.current.x, currentPos.current.y, newPos.x, newPos.y, '#6b4ce6', true);
        currentPos.current = newPos;
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async () => {
        if (!userId) {
            setSubmissionResult("Error: Unauthorized. Please log in.");
            return;
        }

        try {
            setIsSubmitting(true); 
            setSubmissionResult("Pending... ⏳"); 
            setAiHint(""); 
            
            const payload = { language, code, problemId: problemData.problem._id, userId: userId };
            const response = await api.post('/submissions/submit', payload);
            const submissionId = response.data.submissionId || response.data.submission?._id;
            
            if (!submissionId) {
                setSubmissionResult("System Error: No ID returned");
                setIsSubmitting(false);
                return;
            }

            const pollInterval = setInterval(async () => {
                try {
                    const statusRes = await api.get(`/submissions/status/${submissionId}`);
                    const currentVerdict = statusRes.data.verdict;

                    if (currentVerdict !== 'Pending') {
                        clearInterval(pollInterval);
                        setSubmissionResult(currentVerdict); 
                        setIsSubmitting(false); 
                    }
                } catch (pollError) {
                    clearInterval(pollInterval);
                    console.error("Polling error", pollError);
                    setSubmissionResult("Server Error");
                    setIsSubmitting(false);
                }
            }, 1500);
            
        } catch (error) {
            console.error("Submission failed", error);
            setSubmissionResult("Compilation Error"); 
            setIsSubmitting(false); 
        }
    };

    const handleGenerateHint = async () => {
        try {
            setIsGeneratingHint(true);
            setAiHint(""); 
            const payload = { code, language, problemTitle: problemData.problem.title, problemDescription: problemData.problem.description, verdict: submissionResult };
            const response = await api.post('/ai/generate-hint', payload);
            setAiHint(response.data.hint);
        } catch (error) {
            console.error("Failed to fetch AI hint:", error);
            setAiHint("Sorry, the AI coach is currently unavailable.");
        } finally {
            setIsGeneratingHint(false);
        }
    };

    if (!user) return null;
    if (!problemData) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading workspace...</div>;

    const { problem, testCases } = problemData;

    return (
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#121215', color: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }}>
            
            {/* LEFT PANE */}
            <div style={{ width: '40%', padding: '30px', borderRight: '1px solid #2a2a35', overflowY: 'auto', backgroundColor: '#16161a' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>{problem.title}</h1>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <span style={{ padding: '5px 10px', backgroundColor: '#1e1e2f', borderRadius: '5px', fontSize: '0.85rem', color: '#a0a0b0' }}>{problem.difficulty || 'Medium'}</span>
                    <span style={{ padding: '5px 10px', backgroundColor: '#1e1e2f', borderRadius: '5px', fontSize: '0.85rem', color: '#a0a0b0' }}>{problem.timeLimit || 1000} ms</span>
                    <span style={{ padding: '5px 10px', backgroundColor: '#1e1e2f', borderRadius: '5px', fontSize: '0.85rem', color: '#a0a0b0' }}>{problem.memoryLimit || 256} MB</span>
                </div>
                
                <p style={{ color: '#a0a0b0', lineHeight: '1.6', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>{problem.description}</p>

                <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#1e1e2f', borderRadius: '8px', border: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ color: '#28a745', fontWeight: 'bold', fontSize: '0.9rem', display: 'block' }}>🔒 Private Session Active</span>
                        <span style={{ color: '#8b8b99', fontSize: '0.8rem' }}>Invite a teammate to collaborate</span>
                    </div>
                    <button onClick={handleCopyLink} style={{ padding: '8px 15px', backgroundColor: copied ? '#28a745' : '#6b4ce6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                        {copied ? '✅ Copied!' : '🔗 Copy Invite Link'}
                    </button>
                </div>

                <h3 style={{ color: '#ffffff', marginTop: '30px', marginBottom: '15px' }}>Sample Test Cases</h3>
                {testCases && testCases.map((tc, index) => (
                    <div key={index} style={{ backgroundColor: '#121215', padding: '15px', borderRadius: '8px', border: '1px solid #2a2a35', marginBottom: '15px', fontFamily: 'monospace', color: '#a0a0b0' }}>
                        <strong style={{ color: '#fff' }}>Input:</strong><pre style={{ margin: '8px 0 15px 0' }}>{tc.input}</pre>
                        <strong style={{ color: '#fff' }}>Output:</strong><pre style={{ margin: '8px 0 0 0' }}>{tc.output}</pre>
                    </div>
                ))}
            </div>

            {/* RIGHT PANE */}
            <div style={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
                
                {/* TOOLBAR */}
                <div style={{ padding: '15px 20px', backgroundColor: '#16161a', borderBottom: '1px solid #2a2a35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    
                    <div style={{ display: 'flex', gap: '10px', backgroundColor: '#121215', padding: '5px', borderRadius: '8px', border: '1px solid #2a2a35' }}>
                        <button onClick={() => setActiveTab('editor')} style={{ padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'editor' ? '#6b4ce6' : 'transparent', color: activeTab === 'editor' ? '#fff' : '#8b8b99' }}>
                            💻 Code Editor
                        </button>
                        <button onClick={() => setActiveTab('whiteboard')} style={{ padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === 'whiteboard' ? '#6b4ce6' : 'transparent', color: activeTab === 'whiteboard' ? '#fff' : '#8b8b99' }}>
                            🎨 Whiteboard
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        {activeTab === 'whiteboard' && (
                            <button onClick={() => clearCanvas(true)} style={{ padding: '10px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                                Clear Canvas
                            </button>
                        )}
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: '8px 12px', backgroundColor: '#1e1e2f', color: 'white', border: '1px solid #2a2a35', borderRadius: '5px', outline: 'none', cursor: 'pointer' }}>
                            <option value="cpp">C++</option>
                            <option value="py">Python</option>
                            <option value="java">Java</option>
                        </select>
                        <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: isSubmitting ? '#4caf5080' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontWeight: 'bold', transition: '0.2s' }}>
                            {isSubmitting ? 'Evaluating...' : 'Submit Code'}
                        </button>
                    </div>
                </div>

                {/* DYNAMIC VIEW */}
                <div style={{ flexGrow: 1, height: '65%', position: 'relative', backgroundColor: '#121215', overflow: 'hidden' }}>
                    
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: activeTab === 'editor' ? 10 : 1, opacity: activeTab === 'editor' ? 1 : 0, pointerEvents: activeTab === 'editor' ? 'auto' : 'none' }}>
                        <Editor height="100%" language={language === 'cpp' ? 'cpp' : language} theme="vs-dark" value={code} onChange={handleEditorChange} options={{ fontSize: 16, minimap: { enabled: false }, padding: { top: 20 } }} />
                    </div>

                    <canvas
                        ref={canvasRef}
                        onMouseDown={onMouseDown}
                        onMouseUp={onMouseUp}
                        onMouseMove={onMouseMove}
                        onMouseOut={onMouseUp}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair', display: 'block', zIndex: activeTab === 'whiteboard' ? 10 : 1, opacity: activeTab === 'whiteboard' ? 1 : 0, pointerEvents: activeTab === 'whiteboard' ? 'auto' : 'none' }}
                    />
                </div>

                {/* THE RESULTS TERMINAL */}
                <div style={{ height: '35%', backgroundColor: '#16161a', padding: '20px', borderTop: '1px solid #2a2a35', overflowY: 'auto' }}>
                    <h3 style={{ margin: '0 0 15px 0', color: '#ffffff' }}>Execution Results</h3>
                    
                    {submissionResult && (
                        <div style={{ padding: '15px', backgroundColor: '#1e1e2f', borderRadius: '8px', borderLeft: `4px solid ${submissionResult === 'Accepted' ? '#28a745' : submissionResult.includes('Pending') ? '#ffc107' : '#dc3545'}`, fontWeight: 'bold', color: submissionResult === 'Accepted' ? '#28a745' : '#ffffff' }}>
                            {submissionResult}
                        </div>
                    )}
                    
                    {submissionResult && submissionResult !== 'Accepted' && !submissionResult.includes('Pending') && (
                        <div style={{ marginTop: '20px' }}>
                            <button onClick={handleGenerateHint} disabled={isGeneratingHint} style={{ width: '100%', padding: '12px', backgroundColor: '#6b4ce6', color: 'white', border: 'none', borderRadius: '5px', cursor: isGeneratingHint ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
                                {isGeneratingHint ? '✨ Analyzing your logic...' : '✨ Generate AI Hint'}
                            </button>

                            {aiHint && (
                                <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#2a2a35', borderLeft: '4px solid #6b4ce6', borderRadius: '8px', color: '#e0e0e0', lineHeight: '1.6' }}>
                                    <strong>Coach AI: </strong>{aiHint}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default Workspace;