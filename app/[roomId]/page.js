"use client"

import { useCallback, useEffect, useState } from 'react';
import { titleColor } from '@/constants/config';
import { setRoomSocketInfo, joinRoom } from '@/redux/slices/roomSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

function page({ params }) {
    const [pageTitle, setPageTitle] = useState([]);
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const roomSocketInfo = useSelector(state => state.roomSlice)
    const dispatch = useDispatch();
    const router = useRouter();

    function renderSiteTitle() {
        let characterArray = [];
        characterArray = "Depict".split('')?.map((character, index) => {
            return { character, color: titleColor[index] }
        })
        setPageTitle(characterArray);
    }

    function redirectToGame(id) {
        router.push(`/game/${id}`);
    }

    const handleJoinRoom = async () => {
        if (username) {
            try {
                const response = await dispatch(joinRoom({ roomId: params.roomId, username }));
                redirectToGame(response.payload.roomId);
            } catch (error) {
                console.error('Error joining room:', error);
            }
        }
        return;
    };

    useEffect(() => {
        renderSiteTitle();
    }, []);

    if (isLoading) {
        return <div className=" flex justify-center items-center h-screen w-screen">
            <Image
                width={100}
                height={100}
                alt="loading"
                src="/assets/loader/loader.svg"
            />
        </div>
    }

    return (
        <div className="flex flex-col justify-center items-center h-screen mx-auto my-auto">
            <span className="font-sil text-9xl">{
                pageTitle.map(letter => {
                    return <span className="font-bold title_stroke" key={letter.character} style={{ color: `${letter.color}` }}>{letter.character}</span>
                })
            }</span>

            <section className="flex flex-col mt-11 p-3 box_shadow create_room_section rounded-md">
                <input onChange={(e) => setUsername(e.target.value)} type="text" value={username} placeholder="Enter your name" className="p-2 rounded-md username_input" />
                <button type="button" onClick={() => handleJoinRoom()} className="text-xl create_room_btn font-exo text-white p-3 rounded-md mt-2 btn_text_shadow">
                    Join Room!
                </button>
            </section>
        </div>
    )
}

export default page;