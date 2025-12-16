import { NextResponse } from 'next/server';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    doc, 
    runTransaction, 
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase/app';

// Get method to fetch groups for a user
export async function GET( request: Request ): Promise<Response> {

    try {
        const url = new URL(request.url);
        const userId = Number(url.searchParams.get('userId'));

        if (!userId) {
            return NextResponse.json(
                { error: 'userId parameter is required' }, 
                { status: 400 }
            );
        }

        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('sharedMemberID', 'array-contains', userId));
        const snapshot = await getDocs(q);
        const groups = snapshot.docs.map(doc => ({...doc.data()}));
        return NextResponse.json({ groups }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
    }
}

// Post method to create a group for a user
interface CreateGroupRequest {
    ownerID: number;
    groupName: string;
    Member_Emails: string;
}

export async function POST(request: Request) {
    const body: CreateGroupRequest = await request.json();
    const { ownerID, groupName, Member_Emails } = body;

    if (!ownerID || !groupName) {
        return NextResponse.json({ 
            message: 'ownerID and groupName are required!',
        }, { status: 400 });
    }

    if (!Member_Emails || Member_Emails.trim() === "") {
        return NextResponse.json({ 
            message: 'Member_Emails cannot be empty!',
        }, { status: 400 });
    }

    const cntDocRef = doc(db, "groups", "id_counter");
    try {
        const newId = await runTransaction(db, async (transaction) => {
            const cntDoc = await transaction.get(cntDocRef);
            if (!cntDoc.exists) {
                throw "Document does not exist!";
            }

            const newCurrent = +cntDoc.data().current + 1;
            transaction.update(cntDocRef, { current: newCurrent });
            return newCurrent;
        });

        await addDoc(collection(db, "groups"), {
            ownerID: Number(ownerID),
            groupID: newId,
            groupName: groupName,
            sharedMembersEmail: Member_Emails.split(',').map(email => email.trim()),
            create_at: Timestamp.now(),
        })

        return NextResponse.json({ 
            message: 'Registration successful!',
            userId: newId,

        }, { status: 201 });

    } catch (error) {
        console.log(`Transaction failed: ${error}`);
    }

    return NextResponse.json({ 
        message: 'Registration failed with error',
    }, { status: 500 });
}

interface UpdateGroupRequest {
    groupID: number;
    Member_Emails: string;
}

export async function PUT(request: Request) {
    const body: UpdateGroupRequest = await request.json();
    const { groupID, Member_Emails } = body;

    try{
        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('groupID', '==', Number(groupID)));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            return NextResponse.json({ 
                message: 'Group not found!',
                body
            }, { status: 404 });
        }

        const groupDoc = snapshot.docs[0];
        await updateDoc(groupDoc.ref, {
            sharedMembersEmail: Member_Emails.split(',').map(email => email.trim()),
        });

        return NextResponse.json({ 
            message: 'Update successful!',
        }, { status: 200 });

    } catch (error) {
        console.log(`Transaction failed: ${error}`);
    }
    return NextResponse.json({ 
        message: 'Update group failed with error',
    }, { status: 500 });
}

