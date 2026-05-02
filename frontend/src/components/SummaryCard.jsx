import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

const SummaryCard = ({ title, amount, icon: Icon, trend, isExpense }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-3xl relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
      
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-2xl ${
          isExpense ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' 
          : 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend > 0 ? (isExpense ? 'text-red-500' : 'text-emerald-500') : (isExpense ? 'text-emerald-500' : 'text-red-500')
          }`}>
            {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
          {formatCurrency(amount)}
        </h2>
      </div>
    </motion.div>
  );
};

export default SummaryCard;
