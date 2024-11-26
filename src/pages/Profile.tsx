import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
      <div className="mt-4 space-y-4">
        <Input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
        />
        <Input 
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          type="number"
        />
        <Input 
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Weight"
          type="number"
        />
        <Input 
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          placeholder="Passkey"
        />
        <Button onClick={handleSave}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default Profile;