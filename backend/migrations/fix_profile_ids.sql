-- Fix 1: Correct the email for existing profile
UPDATE profiles SET email = 'sohelsokal0@gmail.com' WHERE id = 'd5bdd5fc-97cc-40f2-b340-155f2471cf47';

-- Fix 2: Create profile for sohelsokal@gmail.com auth user
INSERT INTO profiles (id, name, email, is_admin)
VALUES ('45f2dd27-ccaa-44a8-b35b-e14ae256ce25', 'Md. Sohel', 'sohelsokal@gmail.com', true)
ON CONFLICT (id) DO UPDATE SET email = 'sohelsokal@gmail.com', is_admin = true;
