"use client";
import { useRef, useState, useEffect, useCallback } from 'react';
import { debounce } from 'lodash';
import { useSelector } from 'react-redux';
import socket from '@/services/socket';


const useCanvas = () => {
    // Initialize refs and state
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawingCommands, setDrawingCommands] = useState([]);
    const [drawingCommandSteps, setDrawingCommandSteps] = useState(-1);
    const [mounted, setMounted] = useState(false);
    const selectedTool = useSelector((state) => state.toolSlice.value.type);
    const selectedBrushSize = useSelector((state) => state.brushSlice.value.size);
    const selectedColor = useSelector((state) => state.colorSlice.value.color);


    // Handle initial setup and cleanup
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const resizeCanvas = () => {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth;
            socket.emit('newClient');
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial canvas size setup
        setMounted(true);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            socket.off('newClient');
        };
    }, []);

    // Handle drawing functionality, including real-time events
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const startDrawing = (e) => {
            e.preventDefault();
            if (selectedTool !== 'FILL') {
                ctx.beginPath();
                setIsDrawing(true);
                draw(e);
            } else {
                changeBackground();
            }
        };

        const changeBackground = () => {
            ctx.fillStyle = selectedColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            socket.emit('fillColor', { selectedColor });
        };

        const draw = (e) => {
            if (selectedTool === 'FILL') return;
            if (!isDrawing) return;

            const rect = canvas.getBoundingClientRect();
            const x = e.clientX ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
            const y = e.clientY ? e.clientY - rect.top : e.touches[0].clientY - rect.top;

            if (x < 0 || x > canvas.width || y < 0 || y > canvas.height) {
                stopDrawing();
                return;
            }
            ctx.strokeStyle = selectedColor;
            ctx.lineWidth = selectedBrushSize;
            ctx.lineCap = 'round';

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);

            // Emit draw event to other clients in real-time
            socket.emit('draw', { x, y, color: selectedColor, brushSize: selectedBrushSize });
        };

        const stopDrawing = () => {
            setIsDrawing(false);
            ctx.closePath();
            saveDrawingCommand();
        };

        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch events
        canvas.addEventListener('touchstart', startDrawing, { passive: true });
        canvas.addEventListener('touchmove', draw, { passive: true });
        canvas.addEventListener('touchend', stopDrawing, { passive: true });

        // Clean up event listeners
        return () => {
            canvas.removeEventListener('mousedown', startDrawing);
            canvas.removeEventListener('mousemove', draw);
            canvas.removeEventListener('mouseup', stopDrawing);
            canvas.removeEventListener('mouseout', stopDrawing);

            // Touch events
            canvas.removeEventListener('touchstart', startDrawing);
            canvas.removeEventListener('touchmove', draw);
            canvas.removeEventListener('touchend', stopDrawing);
        };
    }, [drawingCommands, isDrawing, selectedTool, selectedColor, selectedBrushSize]);

    // Save drawing command and emit 'draw' event
    const saveDrawingCommand = useCallback(
        () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const command = {
                type: 'draw',
                dataURL: canvas.toDataURL(),
            };

            socket.emit('draw', { command });

            setDrawingCommands((prevCommands) => {
                if (drawingCommandSteps < prevCommands.length - 1) {
                    return prevCommands.slice(0, drawingCommandSteps + 1).concat(command);
                }
                return prevCommands.concat(command);
            });
            setDrawingCommandSteps((prevCommand) => prevCommand + 1);
        },
        [drawingCommandSteps, drawingCommands]
    );

    // Handle 'draw' events from other clients
    useEffect(() => {
        // Listen for the 'newClient' event to send the current drawing state to a new client
        socket.emit('newClient');
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const handleDraw = async (data) => {
            const { x, y, color, brushSize } = data;

            ctx.strokeStyle = color;
            ctx.lineWidth = brushSize;
            ctx.lineCap = 'round';

            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        };

        const restoreDrawing = async (data) => {
            const { commands, index } = data;
            ctx.clearRect(0, 0, canvas.width, canvas.height);



            await Promise.all(
                commands?.map((command) => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.src = command.dataURL;

                        img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                            resolve();
                        };
                    });
                })
            );
        };

        const fillColor = ({ selectedColor }) => {
            ctx.fillStyle = selectedColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        };

        const clearCanvas = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        };

        socket.on('drawFromServer', handleDraw);
        socket.on('restoreDrawing', restoreDrawing);
        socket.on('clearCanvas', clearCanvas);
        socket.on('fillColor', fillColor);
        socket.on('get-canvas-state', () => {
            if (canvasRef?.current === null || !canvasRef.current.toDataURL() === null) return
            socket.emit('canvas-state', canvasRef.current.toDataURL());
        });

        socket.on('canvas-state', restoreDrawing);



        return () => {
            socket.off('drawFromServer');
            socket.off('restoreDrawing');
            socket.off('clearCanvas');
            socket.off('fillColor');

        };
    }, [socket]);

    const restoreDrawingCommands = useCallback(
        async (index) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const commands = drawingCommands.slice(0, index + 1);

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            await Promise.all(
                commands?.map((command) => {
                    return new Promise((resolve) => {
                        const img = new Image();
                        img.src = command.dataURL;

                        img.onload = () => {
                            ctx.drawImage(img, 0, 0);
                            resolve();
                        };
                    });
                })
            );

            setDrawingCommandSteps(index);
            // Emit 'restoreDrawing' event to the server
            socket.emit('restoreDrawing', { commands, index });
        },
        [drawingCommands, socket]
    );

    const undo = useCallback(() => {
        if (drawingCommandSteps >= 0) {
            restoreDrawingCommands(drawingCommandSteps - 1);
        }
    }, [drawingCommandSteps, restoreDrawingCommands]);

    const redo = useCallback(() => {
        if (drawingCommandSteps < drawingCommands.length - 1) {
            restoreDrawingCommands(drawingCommandSteps + 1);
        }
    }, [drawingCommandSteps, restoreDrawingCommands]);

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        setDrawingCommands([]);
        setDrawingCommandSteps(-1);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        socket.emit('clearCanvas');
    });

    return { canvasRef, mounted, undo, redo, clearCanvas };
};

export default useCanvas;
