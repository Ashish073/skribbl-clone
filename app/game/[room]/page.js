"use client"

import { useEffect, useState, useRef } from 'react';
import useUndoRedo from '@/hooks/useUndoRedo';
import useCanvas from '@/hooks/useCanvas';
import ColorPalette from '@/components/ColorPalette';
import BrushTool from '@/components/BrushTool';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import { setSelectedTool } from '@/redux/slices/toolSlice';
import { setRoomData, resetRoomData } from '@/redux/slices/roomSlice';
import UserCard from '@/components/UserCard';
import socket from '@/services/socket';
import Settings from '@/components/Settings';

const words = [
    "Apple",
    "Mango",
    "Banana"
]

const DrawingCanvas = ({ params }) => {
    const { canvasRef, mounted, undo, redo, clearCanvas } = useCanvas();
    const [wordArray, setWordArray] = useState([]);
    const [countdownSeconds, setCountdownSeconds] = useState(0);
    const [selectedWord, setSelectedWord] = useState('');
    const [isGame, setIsGame] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false)
    const word = 'sesquipedalian'
    const router = useRouter();
    const dispatch = useDispatch();
    const selectedTool = useSelector((state) => state.toolSlice.value.type);
    const roomSocketInfo = useSelector(state => state.roomSlice.value);
    const roomSocketRef = useRef(roomSocketInfo);
    const { roomData, roomSettings } = roomSocketInfo;
    const isCurrentPlayer = Boolean(roomData.filter(client => client.isActivePlayer === true && client.socketId === socket.id).length)
    const isWaitingPlayer = Boolean(roomData.filter(client => client.isActivePlayer === false && client.socketId === socket.id).length)
    useUndoRedo(undo, redo);

    const onClickClearCanvas = () => {
        clearCanvas();
    }

    function onSelectPaintBucket(type) {
        if (type === 1) {
            dispatch(setSelectedTool('BRUSH'));
            return;
        }
        if (type === 2) {
            dispatch(setSelectedTool('PENCIL'));
            return;
        }
        dispatch(setSelectedTool('FILL'));
    }

    function getCharacterArray(wordOption) {
        let characterArray = []
        characterArray = wordOption.toLocaleUpperCase().split('')?.map(character => {
            return { character, isVisible: false }
        })
        return characterArray;
    }

    function selectWordOption(wordOption) {
        setSelectedWord(wordOption);
        const characterArray = getCharacterArray(wordOption);
        const randomNumber = Math.floor(Math.random() * (characterArray.length - 1))
        socket.emit('selectedWord', { word: wordOption, roomId: params.room, position: randomNumber })
    }

    function renderWord(wordOption, position) {
        const characterArray = getCharacterArray(wordOption);
        characterArray[position].isVisible = true;
        setWordArray(characterArray);
    }

    async function initialization(roomInfo) {
        try {
            setIsLoading(true)
            socket.emit('checkRoom', { roomId: params.room });
            socket.on('check-room-status', ({ roomExists }) => {
                if (!roomExists && (!roomInfo || !roomInfo.roomId)) { router.push('/'); return; }
                if (roomExists && (!roomInfo || !roomInfo.roomId)) { router.push(`/${params.room}`); return; }
            });
            if (roomInfo?.roomId !== params.room) return;
            socket.on('userJoined', ({ roomData }) => {
                dispatch(setRoomData({ roomData }));
            })
            // socket.emit('getInitialCountdown');
            // socket.emit('startCountdown', 60);
            // const countdownListener = (updatedSeconds) => {
            //     setCountdownSeconds(updatedSeconds);
            // };
            // socket.on('', countdownListener);
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false)
        }

    }

    useEffect(() => {

    }, []);

    useEffect(() => {
        if (roomData.length) {
            socket.on('changeInUsers', ({ newRoomData, prevRoomId }) => {
                if (prevRoomId === params.room) {
                    dispatch(setRoomData({ roomData: newRoomData }));
                }
            });
        }
        if (roomData.filter(client => client.isActivePlayer === false && client.socketId === socket.id).length) {
            socket.on('getSelectedWord', ({ word, position }) => {
                setSelectedWord(word);
                if (word) {
                    renderWord(word, position);
                }
            })
        }
        clearCanvas();
        initialization(roomSocketInfo);
        const cleanup = () => {
            socket.off('getSelectedWord');
            socket.off('check-room-status');
            socket.off('getUsers');
            socket.off('usersList');
            socket.off('changeInUsers');
        };

        const handlePageUnload = () => {
            console.log('roomSocketInfo.roomId', roomSocketInfo.roomId)
            socket.emit('disconnected-from-game', { roomId: roomSocketInfo.roomId, socketId: socket.id });
            dispatch(resetRoomData());
        };

        window.addEventListener('beforeunload', handlePageUnload);
        window.addEventListener('popstate', handlePageUnload);
        return () => {
            cleanup();
            window.removeEventListener('beforeunload', handlePageUnload);
            window.removeEventListener('popstate', handlePageUnload);
        };
    }, [socket, roomSocketInfo]);


    if (!roomSocketInfo.roomId) {
        return <div className=" flex justify-center items-center h-screen w-screen">
            <Image
                width={100}
                height={100}
                alt="loading"
                src="/assets/loader/loader.svg"
            />
        </div>
    }

    function handleCursorImage() {
        if (isCurrentPlayer) {
            if (selectedTool === 'BRUSH' || selectedTool === 'PENCIL') {
                return 'url("/assets/images/pencil.png") 10 42, auto'
            }
            if (selectedTool === 'FILL') {
                return 'url("/assets/images/paint_bucket_24x24.png") 12 56, auto'
            }
        }
        return 'pointer'
    }

    if (roomSocketInfo.roomId) {
        return (
            <main>
                <div className="main">
                    <div className="flex flex-col">
                        <div className="bg-white flex justify-between items-center md:rounded-md w-full mx-auto p-2 md:mb-2 font-semibold">
                            <span className="border border-black p-2 rounded-full">
                                <span className=" m-1">
                                    {countdownSeconds}
                                </span>
                            </span>
                            {
                                isGameStarted && isCurrentPlayer ?
                                    (

                                        <span className="text-2xl hidden md:flex bg-white text-center uppercase">
                                            {selectedWord}
                                        </span>
                                    ) :
                                    (
                                        <span className="w-2/4 hidden md:flex md:justify-center">
                                            {
                                                wordArray?.map((character, index) => {
                                                    return (
                                                        <span key={`${character}-${index}`} className="mx-1 flex flex-col justify-end items-end">
                                                            <span className="characters_holder">
                                                                {character.isVisible ? character.character : ''}
                                                            </span>
                                                            <span className="underline" style={{ width: '10px', height: '2px', background: '#000' }} />
                                                        </span>
                                                    )
                                                })
                                            }
                                        </span>
                                    )
                            }
                            {
                                !isGameStarted ? (
                                    <span>{roomSettings.rounds} Rounds</span>
                                ) : (
                                    <span className="whitespace-wrap">Round 0 of {roomSettings.rounds}</span>
                                )
                            }

                        </div>
                        {
                            isGameStarted && isCurrentPlayer ?
                                (

                                    <span className="text-2xl block md:hidden bg-white text-center">
                                        {selectedWord}
                                    </span>
                                ) :
                                <span className="text-2xl justify-center p-3 flex md:hidden bg-white text-center">
                                    {
                                        wordArray?.map((character, index) => {
                                            return (
                                                <span key={`${character}-${index}`} className="mx-1 flex flex-col justify-end items-end">
                                                    <span className="characters_holder">
                                                        {character.isVisible ? character.character : ''}
                                                    </span>
                                                    <span className="underline" style={{ width: '10px', height: '2px', background: '#000' }} />
                                                </span>
                                            )
                                        })
                                    }
                                </span>
                        }
                        <div className="flex md:flex-row flex-col-reverse">
                            <div className="lg:flex-col overflow-auto lg:mr-1 mx-auto players_section rounded-md mt-3 lg:mt-0">
                                {
                                    roomData?.map((user, index) => {
                                        return <div key={`${user.username}- ${index} `}><UserCard isCurrentPlayer={isCurrentPlayer} data={user} roomSocketInfo={roomSocketInfo} /></div>
                                    })
                                }
                            </div>
                            <div className="canvas_holder flex flex-col justify-start align-center md:ml-1">
                                <div className='relative overflow-hidden'>
                                    {
                                        mounted && roomData.length ?

                                            <Settings isGameStarted={isGameStarted} setIsGameStarted={setIsGameStarted} roomData={roomData} roomId={params.room} clientInfo={roomData.find(client => client.socketId === socket.id)} /> : null
                                    }
                                    {
                                        roomData?.length && isCurrentPlayer && isGameStarted ?
                                            (
                                                <div className={`${!selectedWord ? 'settings_layer' : 'settings_layer remove'} flex flex-col items-center justify-center p-3 h-full`}>
                                                    <p className="text-white text-2xl mb-5">
                                                        Choose a word!
                                                    </p>
                                                    <div className="flex justify-center">
                                                        {
                                                            words.map(word => {
                                                                return (
                                                                    <button className="rounded-md border-2 mx-2 p-3 text-white hover:bg-slate-500" onClick={() => selectWordOption(word)}>
                                                                        {word}
                                                                    </button>
                                                                )
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            ) : null
                                    }
                                    {
                                        isGameStarted && isWaitingPlayer ? (
                                            <div className={`${!selectedWord ? 'settings_layer' : 'settings_layer remove'} flex flex-col items-center justify-center p-3 h-full`}>
                                                <p className='text-white text-2xl'>
                                                    {
                                                        roomData.filter(client => client.isActivePlayer === true)[0]?.username || 'Player'
                                                    } is choosing a word
                                                </p>
                                            </div>
                                        ) : null
                                    }
                                    <canvas
                                        className="border rounded-md border-indigo-800 bg-white draw_canavas"
                                        ref={canvasRef}
                                        width={750}
                                        height={450}
                                        style={{ cursor: handleCursorImage(), pointerEvents: `${isCurrentPlayer ? 'auto' : 'none'}` }}
                                    />
                                </div>
                                {
                                    roomData?.length && isCurrentPlayer && isGameStarted && selectedWord ?
                                        (
                                            <div className="mb-4">
                                                <div className="flex justify-center lg:justify-between items-center flex-wrap">
                                                    <div className='flex justify-center items-center'>
                                                        <ColorPalette />
                                                    </div>

                                                    <div className="flex justify-center md:justify-end items-center mt-1">
                                                        <BrushTool onSelectPaintBucket={onSelectPaintBucket} />
                                                        <button
                                                            type="button"
                                                            className={`bg-white rounded-md  ml-2 mx-1 mt-1 box_shadow
                                        ${selectedTool === 'FILL' ? 'border-4 border-yellow-300 p-1' : 'p-2'} `
                                                            }
                                                            onClick={() => onSelectPaintBucket(3)}
                                                        >
                                                            <Image
                                                                src='/assets/images/paint_bucket.png'
                                                                width={25}
                                                                height={25}
                                                                alt="fill"
                                                            />
                                                        </button>
                                                        <button type="button" className="bg-white rounded-md p-2 mx-1 mt-1 box_shadow" onClick={undo}>
                                                            <Image
                                                                src='/assets/images/undo.svg'
                                                                width={25}
                                                                height={25}
                                                                alt="undo"
                                                            />
                                                        </button>
                                                        <button type="button" className="bg-white rounded-md p-2 mx-1 mt-1 box_shadow" onClick={redo}>
                                                            <Image
                                                                src='/assets/images/undo.svg'
                                                                width={25}
                                                                height={25}
                                                                alt="redo"
                                                                style={{ transform: 'scaleX(-1)' }}
                                                            />
                                                        </button>
                                                        <button type="button" className="bg-white rounded-md p-2 mx-1 mt-1 box_shadow" onClick={onClickClearCanvas}>
                                                            <Image
                                                                src='/assets/images/bin.svg'
                                                                width={25}
                                                                height={25}
                                                                alt="bin"
                                                            />
                                                        </button>
                                                    </div>

                                                </div>
                                            </div>
                                        ) : null
                                }
                                {
                                    roomData?.length && isWaitingPlayer && isGameStarted ?
                                        (
                                            <div className="w-full flex justify-between mb-4">
                                                <input type="text" className="w-full rounded-l-md p-1 px-2 disabled:bg-slate-500" disabled={!!!selectedWord} placeholder="Type in your guess..." />
                                                <button className="rounded-r-md bg-green-500 p-2 disabled:bg-slate-500" disabled={!!!selectedWord}>
                                                    <Image
                                                        width={20}
                                                        height={20}
                                                        src="/assets/icons/send.svg"
                                                    />
                                                </button>
                                            </div>
                                        ) : null
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }
};

export default DrawingCanvas;