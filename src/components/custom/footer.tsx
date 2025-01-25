import { buttonVariants } from '#src/components/ui/button';
import { cn } from '#src/utils/misc';
import { Copyright } from 'lucide-react';
import { Link } from 'react-router';

const Footer = () => {
  const date = '__DATE__';
  return (
    <div className='flex items-center justify-between absolute bottom-0 w-full'>
      <div className='Home-built px-4 text-muted-foreground gap-1 text-xs [&_svg]:size-3 mb-1.5'>
        Built at : {date}
      </div>
      <Link
        className={cn(
          buttonVariants({ variant: 'link' }),
          'text-muted-foreground gap-1 uppercase text-xs [&_svg]:size-3 mb-1.5',
        )}
        to='/about'
      >
        <Copyright /> 2025 Huda
      </Link>
    </div>
  );
};

export default Footer;
