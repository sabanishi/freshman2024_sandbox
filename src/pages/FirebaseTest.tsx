import {Component, createSignal, onMount} from 'solid-js';

import {db} from '../FirebaseConfig';
import {collection, doc, getDocs, setDoc} from "firebase/firestore";

class Data {
    private docName: string;
    private text: string;
    private count: number;

    public getDocName() : string{
        return this.docName;
    }

    public getText() : string{
        return this.text;
    }

    public getCount() : number{
        return this.count;
    }

    constructor(docName:string,text: string, count: number) {
        this.docName = docName;
        this.text = text;
        this.count = count;
    }


    //データをFirebaseに送信できる形に変換
    public toDict(): { [key: string]: any } {
        return {
            text: this.text,
            count: this.count
        };
    }
}


const FirebaseTest: Component = () => {
    const [messages, setMessages] = createSignal<Data[]>([]);

    let id : string = "test";
    let text = "test";
    let count = 0;


    const sendMessage = async () => {
        let message:Data = new Data(id,text,count);
        //Documentの追加
        await sendDocumentData(message)

        await fetchMessages();
    };

    //Firebaseにデータを送信する
    const sendDocumentData = async (data : Data) => {
        const path = data.getDocName();
        await setDoc(doc(db, "root",path), data.toDict());
    };

    //Firebaseから全データを取得する
    const fetchMessages = async () => {
        const querySnapshot = await getDocs(collection(db, "root"));
        const messageList: Data[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();

            //doc内の全データを取得
            const id = doc.id;
            const text = data.text;
            const count = data.count;
            messageList.push(new Data(id,text,count));
        });
        setMessages(messageList);
    };

    onMount(() => {
        fetchMessages();
    });

    // @ts-ignore
    return (
        <div>
            <input type="text" value={id} onInput={(e) => id = e.target.value}/>
            <input type="text" value={text} onInput={(e) => text = e.target.value}/>
            <input type="number" value={count} onInput={(e) => count = parseInt(e.target.value)}/>

            <button onClick={sendMessage}>Send</button>

            <ul>
                {messages().map((msg, index) => (
                    <li>{msg.getDocName()}:{msg.getText()},{msg.getCount()}</li>
                ))}
            </ul>
        </div>
    );
};

export default FirebaseTest;
