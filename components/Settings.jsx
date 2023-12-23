import { useEffect, useState } from 'react'
import Dropdown from './Dropdown'
import socket from '@/services/socket';
import { generateNumberOptions } from '@/utils/utils'
import { useDispatch, useSelector } from 'react-redux';
import { setRoomSettings } from '@/redux/slices/roomSlice';

function Settings(props) {
    const { clientInfo, roomId, roomData, isGameStarted, setIsGameStarted } = props;
    const [settingInfo, setSettingInfo] = useState({})
    const roomSocketInfo = useSelector(state => state.roomSlice.value);
    const { players, rounds, drawTime, hints } = roomSocketInfo.roomSettings;
    const dispatch = useDispatch();

    function onChangeValue(key, option) {
        socket.emit('setRoomSettings', {
            roomSettings: {
                ...roomSocketInfo.roomSettings,
                [key]: option.value
            },
            roomId
        });
        socket.on('broadcastRoomSettings', ({ roomSettings }) => {
            dispatch(setRoomSettings({ roomSettings }));
            setSettingInfo(roomSettings);
        });
    }

    function clickStartGame() {
        socket.emit('startGame', { roomId });

    }

    useEffect(() => {
        socket.emit('get-room-settings', { roomId })
        socket.on('getRoomSettings', ({ roomSettings }) => {
            dispatch(setRoomSettings({ roomSettings }));
        });
        socket.on('broadcastRoomSettings', ({ roomSettings }) => {
            dispatch(setRoomSettings({ roomSettings }));
        });

        socket.on('changeStateToStarted', (status) => {
            if (status) setIsGameStarted(status);
        })

        return () => {
            socket.off('getRoomSettings');
            socket.off('broadcastRoomSettings');
        }
    }, [socket])


    return (
        <div className={`${!isGameStarted ? 'settings_layer' : 'settings_layer remove'} flex flex-col justify-between p-3 h-full`}>
            {
                clientInfo ?
                    (
                        <div className="flex flex-col justify-between h-full">

                            <div className="h-full">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-5 md:mb-2">
                                    <label className="text-white md:mr-10">Players</label>
                                    <div className="w-full md:w-64">
                                        <Dropdown
                                            isDisabled={clientInfo?.isActivePlayer !== true}
                                            onChange={(option) => onChangeValue('players', option)}
                                            value={players}
                                            options={generateNumberOptions(2, 6)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-5 md:mb-2">
                                    <label className="text-white md:mr-10">Rounds</label>
                                    <div className="w-full md:w-64">
                                        <Dropdown
                                            onChange={(option) => onChangeValue('rounds', option)}
                                            isDisabled={clientInfo?.isActivePlayer !== true}
                                            value={rounds}
                                            options={generateNumberOptions(2, 10)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-5 md:mb-2">
                                    <label className="text-white md:mr-10">Draw time</label>
                                    <div className="w-full md:w-64">
                                        <Dropdown
                                            onChange={(option) => onChangeValue('drawTime', option)}
                                            isDisabled={clientInfo?.isActivePlayer !== true}
                                            value={drawTime}
                                            options={generateNumberOptions(2, 12, 10)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-start mb-5 md:mb-2">
                                    <label className="text-white md:mr-10">Hints</label>
                                    <div className="w-full md:w-64">
                                        <Dropdown
                                            onChange={(option) => onChangeValue('hints', option)}
                                            isDisabled={clientInfo?.isActivePlayer !== true}
                                            value={hints}
                                            options={generateNumberOptions(1, 4, 1)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="w-full">
                                <button disabled={!clientInfo?.isActivePlayer || roomData.length === 1} onClick={clickStartGame} className="capitalize text-lg create_room_btn w-full font-exo text-white p-3 rounded-md btn_text_shadow disabled:bg-gray-500 hover:bg-green-500 active:bg-green-600">
                                    START!
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-white">
                            Encountered an error
                        </p>
                    )
            }
        </div>
    )
}

export default Settings