import { useState } from 'react';
import { Button, TextInput } from '@/components/ui/button';

const Profile = () => {
  const [passkey, setPasskey] = useState<string>("123456");
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [weight, setWeight] = useState<string>("");

  const handleSave = () => {
    const profileData = {
      name,
      age,
      weight,
      passkey
    };
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    alert("Profile saved successfully!");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Profile Settings</h1>
      <div className="mt-4">
        <TextInput 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="mb-2"
        />
        <TextInput 
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          className="mb-2"
          type="number"
        />
        <TextInput 
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight"
          className="mb-2"
          type="number"
        />
        <TextInput 
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          placeholder="Passkey"
          className="mb-2"
        />
        <Button onClick={handleSave} className="mt-2">
          Save
        </Button>
      </div>
    </div>
  );
};

export default Profile;
