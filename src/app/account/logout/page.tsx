import LogoutClientEffect from '@/ui/components/auth/LogoutClientEffect';

const Page = () => {
  return (
    <div>
      <p className="text-body text-secondary">Logging out...</p>
      <LogoutClientEffect />
    </div>
  );
};

export default Page;
